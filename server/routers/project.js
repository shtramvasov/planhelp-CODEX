var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectStatus = require('../models/project_status');

// Список проектов или детали проекта
router.get('/:project_id?', async (req, res, next) => {
    const { project_id } = req.params;
    const { user_id } = req.userModel;
    let con;
    try {
        con = await mysql.getConnection();

        // список разрешенных проектов или один
        const projectList = await Project.find(con,{
            select : "project.*, pu.user_role",
            joins : [
                { table: 'project_user pu', on : "project.project_id = pu.project_id" }
            ], 
            where : {
                is_deleted : 'N',
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
        projectOne.project_user_list = await ProjectUser.find(con,{ 
            select : "project_user.user_id, ref_users.login, project_user.user_role",
            joins : [
                { table : "ref_users", on : "project_user.user_id = ref_users.user_id" }
            ],
            where : {
                project_id
            }
        });
        projectOne.project_status_list = 
            await ProjectStatus.find(con, {
                where : { project_id , is_deleted : ProjectStatus.CONSTANTS.N},
                order : "orderby"
            });
        res.send(projectOne);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

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
                total_user_count : 0
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

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) 'Permission denied';

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

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) 'Permission denied';

        await ProjectUser.create(con,{values : { project_id, user_id, user_role }});

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

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) 'Permission denied';

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

        if (projectRole.user_role !== ProjectUser.CONSTANTS.OWNER) 'Permission denied';

        await ProjectUser.delete(con,{where : { project_id, user_id }});

        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

module.exports = router;