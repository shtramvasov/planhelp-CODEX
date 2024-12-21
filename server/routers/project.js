var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
const withTransaction = require('./helper/withTransaction');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectStatus = require('../models/project_status');
const ProjectTags = require('../models/project_tags');
const ProjectSprints = require('../models/project_sprints');

// Список проектов или детали проекта
router.get('/:project_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { project_id } = req.params;
    const { user_id } = req.userModel;

    // список разрешенных проектов или один
    const projectList = await Project.find(con,{
        select : `project.*, 
                  pu.user_role,
                  ( -- кол-во открытых задач по проектам
                   select count(*) 
                     from project_task pt 
                    where pt.status_id != ps.status_id
                      and pt.project_id = project.project_id
                      and (pt.executor_id = pu.user_id 
                             or pt.responsible_id = pu.user_id 
                                or pt.reviewer_id = pu.user_id)
                   ) user_project_task_open_count,
                  ps.status_id`,
        joins : [
            { table: 'project_user pu', on : "project.project_id = pu.project_id" },
            { table: 'project_status ps', 
                on : "project.project_id = ps.project_id and ps.is_closed = 'Y' and ps.is_deleted = 'N'", 
                type: 'left join' }
        ], 
        where : {
            "project.is_deleted" : 'N',
            "project.project_id" : project_id,
            "pu.user_id" : user_id
        },
        order : "project.project_id desc"
    });

    if (!project_id) {
        res.send(projectList);
        return;
    }
    const projectOne = projectList[0];
    // Если детали проекта - достаем доп свойства
    projectOne.created_by_model = 
        (await RefUsers.find(con,{ select : "login, user_id",where : {user_id : user_id} }))[0];
    // люди проекта
    projectOne.project_user_list = await ProjectUser.find(con,{ 
        select : "project_user.user_id, ref_users.login, project_user.user_role",
        joins : [
            { table : "ref_users", on : "project_user.user_id = ref_users.user_id" }
        ],
        where : {
            project_id
        }
    });
    // статусы проекта
    projectOne.project_status_list = 
        await ProjectStatus.find(con, {
            where : { project_id , is_deleted : ProjectStatus.CONSTANTS.N},
            order : "orderby"
        });
    // тэги проекта
    projectOne.project_tag_list = 
        await ProjectTags.find(con, {
            where : { project_id },
            order : "tag"
        });
    const openSprints = await ProjectSprints.find(con, {
        where : { 
            project_id : project_id, 
            is_deleted : ProjectSprints.CONSTANTS.IS_DELETED.NO,
            status : ProjectSprints.CONSTANTS.STATUS.OPEN 
        }
    })
    projectOne.project_open_sprints = openSprints;
    res.send(projectOne);
}));

// Создание проекта
router.post('/', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { project_name, project_note } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        const project_id = await Project.create(con,{
            values : {
                project_name : project_name,
                project_note : project_note,
                created_on : { expression : "now()" },
                created_by : user_id,
                is_deleted : Project.CONSTANTS.N,
                total_task_count : 0,
                total_user_count : 1
            }
        });
        // тот кто сто создал проект - owner
        await ProjectUser.create(con, {
            values : {
                project_id,
                user_id,
                user_role : ProjectUser.CONSTANTS.OWNER
            }
        });
        // создаем дефолтный набор статусов
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "Бэклог", variant : "light", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 1, is_closed : 
            ProjectStatus.CONSTANTS.N
        }});
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "К выполнению", variant : "info", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 2, is_closed : 
            ProjectStatus.CONSTANTS.N
        }});
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "В работе", variant : "success", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 3, is_closed : 
            ProjectStatus.CONSTANTS.N
        }});
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "Проверяется", variant : "warning", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 4, is_closed : 
            ProjectStatus.CONSTANTS.N
        }});
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "Выполнено", variant : "primary", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 5, is_closed : 
            ProjectStatus.CONSTANTS.N
        }});
        await ProjectStatus.create(con, {values:{
            project_id, status_name : "Закрыто", variant : "secondary", 
            is_deleted : ProjectStatus.CONSTANTS.N, orderby: 6, is_closed : 
            ProjectStatus.CONSTANTS.Y
        }});

        res.send({project_id});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Изменение проекта
router.post('/:project_id', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { project_id } = req.params;
    const { project_name, project_note, is_deleted, project_status_list } = req.body;
    // project_status_list - массив статусов проекта
    let con;
    try {
        con = await mysql.getConnection();
        if (is_deleted) {
            if (![Project.CONSTANTS.Y,Project.CONSTANTS.N].includes(is_deleted)) 
                throw "Not valid is_deleted in body params, only Y or N";
        }
        const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id}}))[0];

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

        await Project.update(con,{
            values : {
                project_name : project_name,
                project_note : project_note,
                is_deleted : is_deleted
            },
            where : { project_id }
        });
        // Если передали массив статусов
        if (project_status_list && Array.isArray(project_status_list) ) {
            for (const status of project_status_list) {
                await ProjectStatus.update(con,{
                    values : { project_id, 
                        status_name : status.status_name, 
                        variant : status.variant, 
                        is_deleted : status.is_deleted || ProjectStatus.CONSTANTS.N, 
                        orderby : status.orderby, 
                        is_closed : status.is_closed
                    },
                    where : { status_id : status.status_id, project_id }
                });
            }
        }
        res.send({project_id});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Добавление роли в проект
router.post('/:project_id/users', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    const { user_id, user_role } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        if (![ProjectUser.CONSTANTS.READ,ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
            .includes(user_role)) throw "Not valid user_role in body params, only WRITE or OWNER or READ";
        const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

        await ProjectUser.create(con,{values : { project_id, user_id, user_role }});
        await Project.update(con, {
            values : {total_user_count : {expression : "total_user_count + 1"}}, 
            where: {project_id}
        });
        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// массовое изменение порядка статусов
router.post('/:project_id/status/orderby', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    let con;
    try {
        con = await mysql.getConnection();
        const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

        const statusList = await ProjectStatus.find(con, {
            where : { project_id , is_deleted : ProjectStatus.CONSTANTS.N},
            order : "orderby"
        });
        let indexFrom=0;
        for(const status of statusList) {
            if (status.status_id === req.body[0].status_id) {
                break;
            }
            indexFrom++;
        }
        let indexTo=0;
        for(const status of statusList) {
            if (status.status_id === req.body[1].status_id) {
                break;
            }
            indexTo++;
        }
        // создаем клон объекта таски
        const status = JSON.parse(JSON.stringify(statusList[indexFrom]));
        // удаляем элемент из массива
        statusList.splice(indexFrom,1);
        // // создаем клон объект
        statusList.splice(indexTo,0,status);

        let i=0;
        for (const status of statusList) {
            const orderby = i++;

            await ProjectStatus.update(con,{
                values : { orderby : orderby },
                where : { status_id : status.status_id, project_id }
            });
        }
        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Добавление / Изменение статусов задач в проекте
router.post('/:project_id/status/:status_id?', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id, status_id } = req.params;
    const { status_name, variant, is_deleted, orderby, is_closed } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        if (is_deleted) {
            if (![ProjectStatus.CONSTANTS.Y,ProjectStatus.CONSTANTS.N].includes(is_deleted)) 
                throw "Not valid is_deleted in body params, only Y or N";
        }
        if (is_closed) {
            if (![ProjectStatus.CONSTANTS.Y,ProjectStatus.CONSTANTS.N].includes(is_closed)) 
                throw "Not valid is_closed in body params, only Y or N";
        }
        const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

        if (!status_id) {
            await ProjectStatus.create(con,{values : { 
                project_id, status_name, variant, 
                is_deleted : is_deleted || ProjectStatus.CONSTANTS.N, 
                orderby, is_closed
            }});
        } else {
            await ProjectStatus.update(con,{
                values : { project_id, status_name, variant, 
                    is_deleted : is_deleted || ProjectStatus.CONSTANTS.N, orderby, is_closed
                },
                where : { status_id, project_id }
            });
        }

        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Отбирает права у проекта для юзера
router.post('/:project_id/users/revoke', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    const { user_id } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

        await ProjectUser.delete(con,{where : { project_id, user_id }});
        await Project.update(con, {
            values : {total_user_count : {expression : "total_user_count - 1"}}, 
            where: {project_id}
        });
        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Добавление / Изменение тэгов задач в проекте
router.post('/:project_id/tag/:tag_id?', withTransaction(async (req, res) => {
    const con = res.locals.dbinstance;

    const profile_user_id = req.userModel.user_id;
    const { project_id, tag_id } = req.params;
    const { tag } = req.body;
        
    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];

    if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

    if (!tag_id) {
        await ProjectTags.create(con,{values : { 
            project_id, tag
        }});
    } else {
        await ProjectTags.update(con,{
            values : { tag },
            where : { tag_id, project_id }
        });
    }

    res.send({ok:true});
}));

router.delete('/:project_id/tag/:tag_id', withTransaction(async (req, res) => {
    const con = res.locals.dbinstance;

    const profile_user_id = req.userModel.user_id;
    const { project_id, tag_id } = req.params;
        
    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) throw 'Permission denied';

    await ProjectTags.delete(con, { where : {
        project_id, tag_id
    } });
    // TODO удаление в связанных задачах?

    res.send({ok:true});
}));

module.exports = router;