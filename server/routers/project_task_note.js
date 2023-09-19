var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var Project = require('../models/project');
var RefUsers = require('../models/ref_users');
var ProjectUser = require('../models/project_user');
var ProjectTask = require('../models/project_task');
var CommonNote = require('../models/common_note');

// Создать / Изменить коммент у таска
router.post('/:project_id/:task_id/:note_id?', async (req, res, next) => {
    const profile_user_id = req.userModel.user_id;
    const { project_id, task_id } = req.params;
    let { note_id } = req.params;
    const { note, is_deleted } = req.body;
    let con;
    try {
        con = await mysql.getConnection();
        
        const projectUser = (await ProjectUser.find(con,{where : {project_id, user_id : profile_user_id}}))[0];
        if (![ProjectUser.CONSTANTS.WRITE,ProjectUser.CONSTANTS.OWNER]
            .includes(projectUser.user_role)) throw "Permission denied";

        if (!note_id) {
            note_id = await CommonNote.createWithTrigger(con, {
                values : {
                    task_id,
                    note,
                    note_type : CommonNote.CONSTANTS.TYPE_COMMENT,
                    is_deleted : is_deleted || '0',
                    created_on : { expression : "now()" },
                    user_id : profile_user_id
                }
            });
        } else {
            await CommonNote.update(con, {
                values : {
                    is_deleted,
                    note
                },
                where : { note_id, task_id }
            });
        }

        res.send({note_id});
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});


module.exports = router;