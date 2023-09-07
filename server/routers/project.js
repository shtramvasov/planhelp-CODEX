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
        projectOne.created_by_model = (await RefUsers.find(con,{ select : "login, user_id",where : {user_id : user_id} }))[0];
        if (projectOne.user_role !== 'READ') {
            projectOne.project_user_list = await ProjectUser.find(con,{ 
                select : "project_user.user_id, ref_users.login, project_user.user_role",
                joins : [
                    { table : "ref_users", on : "project_user.user_id = ref_users.user_id" }
                ],
                where : {
                    project_id
                }
            });
        }
        projectOne.project_status_list = await ProjectStatus.find(con, {where : { project_id , is_deleted : 'N'}});
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
                is_deleted : "N",
                total_task_count : 0,
                total_user_count : 0
            }
        });
        await ProjectUser.create(con, {
            values : {
                project_id,
                user_id,
                user_role : "OWNER"
            }
        });
        res.send({project_id});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Изменени проекта
router.post('/:project_id', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { project_id } = req.params;
    const { project_name, project_note, is_deleted } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        
        const projectRole = await ProjectUser.find(con,{where : {project_id, user_id}});

        if (projectRole.user_role !== "OWNER") 'Permission denied';

        await Project.update(con,{
            values : {
                project_name : project_name,
                project_note : project_note,
                is_deleted : is_deleted
            },
            where : { project_id }
        });
        
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
        const projectRole = await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}});

        if (projectRole.user_role !== "OWNER") 'Permission denied';

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
        const projectRole = await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}});

        if (projectRole.user_role !== "OWNER") 'Permission denied';

        if (!status_id) {
            await ProjectStatus.create(con,{values : { 
                project_id, status_name, variant, is_deleted : is_deleted || 'N' , orderby, is_closed
            }});
        } else {
            await ProjectStatus.update(con,{
                values : { project_id, status_name, variant, is_deleted : is_deleted || 'N', orderby, is_closed},
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
        const projectRole = await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}});

        if (projectRole.user_role !== "OWNER") 'Permission denied';

        await ProjectUser.delete(con,{where : { project_id, user_id }});

        res.send({ok:true});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

module.exports = router;