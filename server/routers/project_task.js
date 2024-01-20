var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
const withTransaction = require('./helper/withTransaction');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectTask = require('../models/project_task');
var CommonNote = require('../models/common_note');
const ProjectTags = require('../models/project_tags');
const ProjectTaskTags = require('../models/project_task_tags');
const ProjectSprints = require('../models/project_sprints');

// Список тасков или детали таски
router.get('/:project_id/:task_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id } = req.params;
    const { limit, offset, executor_id, responsible_id, reviewer_id, status_id, tag_id, sprint_id} = req.query;
    let { status_ids } = req.query;
        
    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (!projectRole) throw 'Permission denied';
    // Получаем список задач
    const taskList = await ProjectTask.getList(con, 
        {project_id, task_id, limit, offset, executor_id, responsible_id, reviewer_id, status_id, status_ids, tag_id, sprint_id}
    );

    if (!task_id) {
        res.send(taskList);
        return;
    }
    const task = taskList[0];
    // Достаем комменты
    const comments = await CommonNote.find(con,{
        select : "common_note.*, ru_created.login",
        joins : [ 
            { table : "ref_users ru_created", on : "common_note.user_id = ru_created.user_id" }
        ],
        where : { task_id, note_type : CommonNote.CONSTANTS.TYPE_COMMENT },
        orderby : "note_id"
    });
    task.comments = comments;
    // Достаем файлы
    const files = await CommonNote.find(con,{
        select : "common_note.*, ru_created.login",
        joins : [ 
            { table : "ref_users ru_created", on : "common_note.user_id = ru_created.user_id" }
        ],
        where : { task_id, note_type : CommonNote.CONSTANTS.TYPE_FILE },
        orderby : "note_id"
    });
    task.files = files;
    // Достаем тэги
    const tags = await ProjectTaskTags.find(con, {
        joins : [ 
            { table : "project_tags", on : "project_task_tags.tag_id = project_tags.tag_id" }
        ],
        where : {task_id}
    });
    task.tags = tags;
    res.send(task);
}));

// Создать / Изменить таск
router.post('/:project_id/:task_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    let { task_id } = req.params;
    const { task_title,task_note,is_deleted,status_id,
        executor_id,responsible_id,reviewer_id, sprint_id } = req.body;
       
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

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
        await ProjectTask.updateWithTrigger(con, {
            values : {
                task_title,
                task_note,
                is_deleted : is_deleted || 'N',
                status_id,
                executor_id, 
                responsible_id, 
                reviewer_id,
                sprint_id,
                updated_by : profile_user_id,
                updated_on : { expression : "now()" }
            },
            where : { project_id, task_id }
        },
        profile_user_id);
    }

    res.send({task_id});
}));

// Работа с тэгами в таске
router.post('/:project_id/:task_id/tags', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id } = req.params;
    const tags = req.body;
       
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    // удаляем все теги
    await ProjectTaskTags.delete(con, { where : { task_id } });

    // создаем теги из массива
    for (let i = 0; i < tags.length; i++) {
        await ProjectTaskTags.create(con, { values: { task_id, tag_id : tags[i].tag_id } });
    }

    // денормализовано сохраняем теги в таску
    // Достаем тэги
    const taskTags = await ProjectTaskTags.find(con, {
        joins : [ 
            { table : "project_tags", on : "project_task_tags.tag_id = project_tags.tag_id" }
        ],
        where : {task_id}
    });
    let tags_str = '';
    for (let i = 0; i < taskTags.length; i++) {
        tags_str += taskTags[i].tag;
        if (i !== taskTags.length-1) {
            tags_str += ',';
        }
    }
    await ProjectTask.update(con, { values : { tags_str }, where : {task_id} });
    res.send({ok:true});

}));

module.exports = router;