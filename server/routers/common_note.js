var express = require('express');
var router = express.Router();
const withTransaction = require('./helper/withTransaction');
const commonNote = require('../models/common_note');

// Список заметок
router.get('/', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { date_start, date_end } = req.query;

    if (!date_start && !date_end) {
        throw Error("date_start and date_end must be set");
    }

    const commonNoteList = await commonNote.find(con, {
        where : {
            _custom : [
                { 
                    sql : ` and common_note.remind_on >= ? `, 
                    value : date_start 
                },
                { 
                    sql : ` and common_note.remind_on <= ? `, 
                    value : date_end 
                }
            ],
            user_id,
            is_deleted : 0
        },
        order : "remind_on"
    });
    
    res.send(commonNoteList);
}));

// Создать заметку
router.post('/', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { remind_on, note, variant, note_type, note_2 } = req.body;

    if (![commonNote.CONSTANTS.TYPE_COMMENT,commonNote.CONSTANTS.TYPE_FILE].includes(note_type)) {
        throw "Not valid note_type in body params, only COMMENT or FILE";
    }
    if (!note) { throw "Missing note in body params"; }
    if (note_type === commonNote.CONSTANTS.TYPE_FILE && !note_2 ) { 
        throw "Missing note_2 in body params for FILE note_type"; 
    }

    await commonNote.create(con, {values: {
        user_id,
        remind_on,
        is_remind : remind_on ? commonNote.CONSTANTS.REMIND_ON : commonNote.CONSTANTS.REMIND_OFF,
        note,
        variant,
        note_type,
        note_2,
        created_on : {expression : "now()"}
    }});
    
    res.send({ok:true});
}));

// Изменить заметку
router.post('/:note_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { note_id } = req.params;
    const { remind_on, is_remind, note, variant, note_2, is_deleted } = req.body;
    
    await commonNote.update(con, {
        values: {
            remind_on,
            is_remind,
            note,
            variant,
            note_2,
            is_deleted,
            updated_on : { expression : "now()" },
            updated_by : user_id
        },
        where : { note_id, user_id }
    });
    
    res.send({ok:true});
}));

module.exports = router;