var express = require('express');
var router = express.Router();
var ProjectUser = require('../models/project_user');
var ProjectTask = require('../models/project_task');
const ProjectTaskTimetable = require('../models/project_task_timetable');
const withTransaction = require('./helper/withTransaction');

// Начинает работу над таской
router.post('/:project_id/:task_id/start', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { project_id, task_id } = req.params;
    const profile_user_id = req.userModel.user_id;

    // действие резрешено с правами WRITE / OWNER
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    // проверям принадлежность таски к проекту и вешаем блокировку на таску
    const task = await ProjectTask.find(con, { 
        where : { project_id, task_id },
        for_update : ""
    });
    if (!task[0]) { throw "Permission denied"; }

    // найдем не закрытый таймлайн для тек юзера
    const timetable = await ProjectTaskTimetable.find(con,{
        where : { task_id, user_id : profile_user_id, date_end : {expression : "is null"} }
    });
    // если нашли - ничего не делаем
    // кейс возможен если в 2х вкладка один и тот же юзер нажимает "Начать"

    if (!timetable[0]) {
        // если не нашли - создаем
        await ProjectTaskTimetable.create(con, { values : {
            task_id,
            user_id : profile_user_id,
            date_start : { expression : "now()" }
        }});
    }

    res.send({ok:true});
}));

// заканчивает работу над таской
router.post('/:project_id/:task_id/end', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { project_id, task_id } = req.params;
    const profile_user_id = req.userModel.user_id;
    
    // действие резрешено с правами WRITE / OWNER
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    // проверям принадлежность таски к проекту и вешаем блокировку на таску
    const task = await ProjectTask.find(con, { 
        where : { project_id, task_id },
        for_update : ""
    });
    if (!task[0]) { throw "Permission denied"; }

    // найдем не закрытый таймлайн для тек юзера
    const timetable = await ProjectTaskTimetable.find(con,{
        where : { task_id, user_id : profile_user_id, date_end : {expression : "is null"} },
        for_update : ""
    });

    // нужен только 1 таймлайн, если она не 1 то выдадим ошибку
    if (timetable.length === 0) {
        throw "Not found open timeline for current user";
    }
    if (timetable.length > 1) {
        throw "Found more 1 opened timeline for current user";
    }

    await ProjectTaskTimetable.update(con, {
        values : { date_end : { expression : "now()"} },
        where : { ptt_id : timetable[0].ptt_id }
    });

    res.send({ok:true});
}));

// Добавляет / изменяет вручную данные по работе с таской
router.post('/:project_id/:task_id/:ptt_id?', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id, ptt_id } = req.params;
    const { date_start, date_end, user_id } = req.body;

    // действие резрешено с правами WRITE / OWNER
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";
        
    // проверям принадлежность таски к проекту и вешаем блокировку на таску
    const task = await ProjectTask.find(con, { 
        where : { project_id, task_id },
        for_update : ""
    });
    if (!task[0]) { throw "Permission denied"; }

    let ptt = [];
    if (ptt_id) {
        ptt = await ProjectTaskTimetable.find(con, {where : {task_id, ptt_id}});
    }

    if (ptt[0]) {
        // если изменение, менять может тот кто в таймлайне указан или OWNER
        if (projectUser.user_role === ProjectUser.CONSTANTS.WRITE && ptt[0].user_id != profile_user_id) {
            throw "Permission denied";
        }
        await ProjectTaskTimetable.update(con, {
            values : { 
                date_start, 
                date_end, 
                user_id : projectUser.user_role === ProjectUser.CONSTANTS.WRITE ? profile_user_id : user_id
            }, 
            where : { task_id, ptt_id }
        });
    }
    if (!ptt[0]) {
        // если создание, user_id либо любой если OWNER либо WRITE - только он
        await ProjectTaskTimetable.create(con, {values : { 
            task_id, 
            user_id : projectUser.user_role === ProjectUser.CONSTANTS.WRITE ? profile_user_id : user_id, 
            date_start, 
            date_end 
        }});
    }

    res.send({ok:true});
}));

// Удаляет данные по работе с таской
router.delete('/:project_id/:task_id/:ptt_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id, ptt_id } = req.params;

    // проверям права
    const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
    if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
        .includes(projectUser.user_role)) throw "Permission denied";

    // проверям принадлежность таски к проекту
    const task = await ProjectTask.find(con, { where : { project_id, task_id } });
    if (!task[0]) { throw "Permission denied"; }

    // удалить может либо OWNER проекта / либо WRITE если этого его таска
    if (projectUser.user_role === ProjectUser.CONSTANTS.WRITE) {
        const ptt = await ProjectTaskTimetable.find(con, {where:{ptt_id, user_id : profile_user_id}});
        if (ptt.length === 0) {
            throw Error("Permission denied");
        }
    }

    // удаляем
    await ProjectTaskTimetable.delete(con, {
        where : {
            ptt_id: req.params.ptt_id,
            task_id: req.params.task_id
        }
    });

    res.send({ok:true});
}));

module.exports = router;