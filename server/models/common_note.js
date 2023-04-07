const mysql = require('../mysqlhelper');

const CONSTANTS = {
    REMIND_ON : 1,
    REMIND_OFF : 0,
    DELETED_ON : 1,
    DELETED_OFF : 0,
    TYPE_COMMENT : "COMMENT",
    TYPE_FILE : "FILE",
}

const createNote = async (
    {user_id,entity_id,remind_on,is_remind,note,variant,note_type,note_2}, con) => {
    return await mysql.query(con,
        `insert into common_note(
            user_id,
            entity_id,
            created_on,
            remind_on,
            is_remind,
            note,
            variant,
            note_type,
            note_2)
        values(?,?,now(),?,?,?,?,?,?)`,
        [ user_id, entity_id, remind_on, is_remind, note, variant, note_type, note_2 ]);
}

const updateNote = async ({user_id,note_id,remind_on,is_remind,note,is_deleted,variant,note_type,note_2}, con) => {
    return await mysql.query(con,
        `update common_note
            set is_deleted = coalesce(?, is_deleted),
                note = coalesce(?, note),
                is_remind = coalesce(?, is_remind),
                remind_on = coalesce(?, remind_on),
                variant = coalesce(?, variant),
                note_type = coalesce(?, note_type),
                note_2 = coalesce(?, note_2)
          where note_id = ?`,
        [ is_deleted, note, is_remind, remind_on, variant, note_type, note_2, note_id ]);
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
          where cn.entity_id = ?
            and cn.is_deleted = 0
          order by cn.note_id
          limit ${limit} offset ${offset}`,
        [ entity_id]);
}

/**
 * Список не отработавших уведомлений, в сортировке по дате уведомления
 * @param {*} param0 
 *  user_id - чьи напоминания
 *  entity_tree - уровень на котором надо показать
 * @param {*} con коннект к БД
 * @returns 
 */
const getRemindNoteList = async ({user_id, entity_tree, limit, offset}, con) => {
    const sqlParams = [];
    // base sql
    let sql = `select cn.*, de.entity_name
                 from common_note cn inner join disk_entity de on cn.entity_id = de.entity_id
                where cn.is_deleted = 0
                  and de.is_deleted = 'N'
                  and cn.is_remind = 1 `;
    if (user_id) {
        // если передали user_id
        sqlParams.push(user_id);
        sql += ` and cn.user_id = ? `;
    }
    if (entity_tree) {
        // если передали дерево (например когда ROOT путь - дерево undefined)
        sqlParams.push(entity_tree + '%');
        sql += ` and entity_tree like ? `;
    }
    sql += ` order by cn.remind_on asc `;

    return await mysql.query(con,sql,sqlParams);
}

module.exports = {
    createNote,
    updateNote,
    deleteNote,
    getNote,
    getNoteList,
    getRemindNoteList,
    CONSTANTS
};