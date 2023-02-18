const mysql = require('../mysqlhelper');

const CONSTANTS = {
    REMIND_ON : 1,
    REMIND_OFF : 0,
    DELETED_ON : 1,
    DELETED_OFF : 0,
}

const createNote = async ({user_id,entity_id,remind_on,is_remind,note,variant}, con) => {
    return await mysql.query(con,
        `insert into common_note(user_id,entity_id,created_on,remind_on,is_remind,note,variant)
        values(?,?,now(),?,?,?,?)`,
        [ user_id, entity_id, remind_on, is_remind, note, variant ]);
}

const updateNote = async ({note_id,remind_on,is_remind,note,is_deleted}, con) => {
    return await mysql.query(con,
        `update common_note
            set is_deleted = coalesce(?, is_deleted),
                note = coalesce(?, note),
                is_remind = coalesce(?, is_remind),
                remind_on = coalesce(?, remind_on)
          where note_id = ?`,
        [ is_deleted, note, is_remind, remind_on, note_id ]);
}

const deleteNote = async ({note_id}, con) => {
    return await updateNote({note_id, is_deleted : CONSTANTS.DELETED_ON}, con);
}

const getNote = async ({ note_id }, con) => {
    return (await mysql.query(con,
        `select cn.* 
           from common_note cn
          where cn.note_id = ?
            and is_deleted = 0`,
        [note_id]))[0];
}

const getNoteList = async ({user_id, entity_id, limit, offset}, con) => {
    return await mysql.query(con,
        `select cn.*, u.login
           from common_note cn inner join ref_users u 
                                on cn.user_id = u.user_id
          where cn.user_id = ?
            and cn.entity_id = ?
            and cn.is_deleted = 0
          order by cn.note_id
          limit ${limit} offset ${offset}`,
        [user_id, entity_id]);
}

module.exports = {
    createNote,
    updateNote,
    deleteNote,
    getNote,
    getNoteList,
    CONSTANTS
};