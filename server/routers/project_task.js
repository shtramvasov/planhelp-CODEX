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
const ProjectStatus = require('../models/project_status');

// Список тасков или детали таски
router.get('/:project_id/:task_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id } = req.params;
    const { limit, offset, executor_id, responsible_id, reviewer_id, status_id, tag_id, sprint_id, sort} = req.query;
    let { status_ids } = req.query;
        
    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (!projectRole) throw 'Permission denied';
    // Получаем список задач
    const taskList = await ProjectTask.getList(con, 
        {project_id, task_id, limit, offset, executor_id, responsible_id, reviewer_id, status_id, status_ids, tag_id, sprint_id, sort}
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
        executor_id,responsible_id,reviewer_id, sprint_id,
        prev_task_id } = req.body;
       
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    let oldModel = {};
    if (task_id) {
        oldModel = (await ProjectTask.find(con, {where:{ 
            task_id : task_id,
            project_id : project_id
        }}))[0];
    }

    let closed_on = null;

    // ищем закрывающий статус проекта
    const projectClosedStatus = (await ProjectStatus.find(con,{where : {
        project_id : project_id,
        is_closed : ProjectStatus.CONSTANTS.Y
    }}))[0];
    if (projectClosedStatus && status_id == projectClosedStatus.status_id && oldModel.status_id != status_id) {
        // если закрывающий статус есть 
        // и он совпадает с вновь прибывшим
        // и статус отличен от предыдущего
        // - то ставим дату закрытия заявки
        closed_on = { expression : "now()" }    
    }

    if (!task_id) {
        task_id = await ProjectTask.create(con, {
            values : {
                project_id,
                task_title,task_note,is_deleted : is_deleted || 'N',status_id,
                executor_id,responsible_id,reviewer_id,
                created_on : { expression : "now()" },
                created_by : profile_user_id,
                orderby_time : { expression : "UNIX_TIMESTAMP(now())" },
                closed_on : closed_on
            }
        });
    } else {
        let prevTask = null;
        if (prev_task_id) {
            // значит меняют с канбана, надо получить сорировку другого элемента
            prevTask = (await ProjectTask.find(con, { where : {task_id : prev_task_id} }))[0];
            currTask = (await ProjectTask.find(con, { where : {task_id : task_id} }))[0];
            let sym = ">";
            if (currTask.status_id === prevTask.status_id) {
                // значит в одном столбце, надо определить куда смещение
                if (parseInt(currTask.orderby_time) > parseInt(prevTask.orderby_time)) {
                    sym = ">="
                } 
            } else {
                // чего делать когда из разных колонок тащат?
                // всегда считать что перенесли вверх
            }
            // +2 секунды ко всем в текущей колонке в этом проекте
            const sql = `update project_task
                            set orderby_time = orderby_time + 2
                          where status_id = ?
                            and project_id = ?
                            and orderby_time ${sym} ? `; 
            // > если сместили вверх, >= если сместили вниз
            console.log(sql, [  status_id, project_id, prevTask.orderby_time ]);
            await mysql.query(con,
                sql, 
                [ status_id, project_id, prevTask.orderby_time ]);
        }
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
                updated_on : { expression : "now()" },
                closed_on : closed_on,
                orderby_time : prevTask ? parseInt(prevTask.orderby_time) +1 : undefined
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