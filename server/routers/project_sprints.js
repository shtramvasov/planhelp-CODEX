var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectTask = require('../models/project_task');
var CommonNote = require('../models/common_note');
const ProjectTags = require('../models/project_tags');
const ProjectTaskTags = require('../models/project_task_tags');
const ProjectSprints = require('../models/project_sprints');
const withTransaction = require('./helper/withTransaction');

// Список тасков или детали таски
router.get('/:project_id/:sprint_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, sprint_id } = req.params;
    const { limit, offset, status } = req.query;
        
    const projectRole = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (!projectRole) throw 'Permission denied';
    // Получаем список спринтов
    const list = await ProjectSprints.getList(con, 
        { project_id, limit, offset, status, is_deleted : ProjectSprints.CONSTANTS.IS_DELETED.NO }
    );

    if (!sprint_id) {
        res.send(list);
        return;
    }
    const one = await ProjectSprints.getOne(con, 
        { project_id, sprint_id }
    );
    
    res.send(one);
}));

// Создать / Изменить спринт
router.post('/:project_id/:sprint_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id } = req.params;
    let { sprint_id } = req.params;
    const { sprint_name, is_deleted, status, date_start, date_end } = req.body;
       
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    if (!sprint_id) {
        sprint_id = await ProjectSprints.create(con, {
            values : {
                project_id,
                sprint_name,
                is_deleted : is_deleted || ProjectSprints.CONSTANTS.IS_DELETED.NO,
                status : status || ProjectSprints.CONSTANTS.STATUS.OPEN,
                created_on : { expression : "now()" },
                created_by : profile_user_id,
                date_start: date_start.replace('.000Z',''),
                date_end : date_end.replace('.000Z','')
            }
        });
    } else {
        await ProjectSprints.update(con, {
            values : {
                sprint_name,
                is_deleted,
                status,
                date_start: date_start?.replace('.000Z',''),
                date_end : date_end?.replace('.000Z',''),
                updated_by : profile_user_id,
                updated_on : { expression : "now()" }
            },
            where : { project_id, sprint_id }
        });
    }

    res.send({sprint_id});
}));

module.exports = router;