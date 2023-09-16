var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectTask = require('../models/project_task');

// Список тасков или детали таски
router.get('/:project_id/:task_id?', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id } = req.params;
    const { limit, offset, executor_id, responsible_id, reviewer_id, status_id} = req.query;
    let { status_ids } = req.query;
    let con;
    try {
        con = await mysql.getConnection();
        // TODO сделать проверку прав
        // TODO перенести в модель?
        const _custom = []
        if (status_ids) {
            status_ids = status_ids.replace(/:/g,",");
            _custom.push( { 
                sql : ` and (project_task.status_id in (${status_ids}) )`, 
                no_value : true 
            } );
        }
        const taskList = await ProjectTask.find(con, {
            select : `project_task.*,
                      ru_created.login as "ru_created_login",
                      ru_executor.login  as "ru_executor_login",
                      ru_executor.user_id  as "ru_executor_id",
                      ru_responsible.login  as "ru_responsible_login",
                      ru_responsible.user_id  as "ru_responsible_id",
                      ru_reviewer.login  as "ru_reviewer_login",
                      ru_reviewer.user_id  as "ru_reviewer_id",
                      project_status.status_name,
                      project_status.variant`,
            joins : [
                { table : "ref_users ru_created", 
                     on : "project_task.created_by = ru_created.user_id" },
                { table : "project_status", 
                   type : "left join",
                     on : "project_task.status_id = project_status.status_id" },
                { table : "ref_users ru_executor", 
                   type : "left join",
                     on : "project_task.executor_id = ru_executor.user_id" },
                { table : "ref_users ru_responsible", 
                   type : "left join",
                     on : "project_task.responsible_id = ru_responsible.user_id" },
                { table : "ref_users ru_reviewer", 
                   type : "left join",
                     on : "project_task.reviewer_id = ru_reviewer.user_id" },
            ],
            where : {
                "project_task.is_deleted" : "N", 
                "project_task.project_id" : project_id, 
                task_id, executor_id, responsible_id, reviewer_id, "project_task.status_id" : status_id,
                _custom : _custom
            },
            order : "task_id desc",
            limit : +limit || 50,
            offset : +offset || 0
        });

        if (!task_id) {
            res.send(taskList);
            return;
        }
        res.send(taskList[0]);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Создать / Изменить таск
router.post('/:project_id/:task_id?', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    let { task_id } = req.params;
    const { task_title,task_note,is_deleted,status_id,
        executor_id,responsible_id,reviewer_id } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        // TODO сделать проверку прав

        if (!task_id) {
            task_id = await ProjectTask.create(con, {
                values : {
                    project_id,
                    task_title,task_note,is_deleted : is_deleted || 'N',status_id,
                    executor_id,responsible_id,reviewer_id,
                    created_on : { expression : "now()" },
                    created_by : profile_user_id
                }
            });
        } else {
            await ProjectTask.update(con, {
                values : {
                    task_title,task_note,is_deleted : is_deleted || 'N',status_id,
                    executor_id, responsible_id, reviewer_id
                },
                where : { project_id, task_id }
            });
        }

        res.send({task_id});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

module.exports = router;