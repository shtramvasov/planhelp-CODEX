const mysql = require('../mysqlhelper');
const Model = require('./Model');
const ProjectTask = require('./project_task');
const NotifyTlgrm = require('./notify_tlgrm');
const Notify = require('./notify');
const RefUsers = require('./ref_users');

class CommonNote extends Model {

    static fields = [
        "note_id",
        "user_id",
        "entity_id",
        "created_on",
        "remind_on",
        "is_remind",
        "is_deleted",
        "note",
        "variant",
        "note_type",
        "note_2",
        "task_id"
    ]

    static table = "common_note";

static CONSTANTS = {
    REMIND_ON : 1,
    REMIND_OFF : 0,
    DELETED_ON : 1,
    DELETED_OFF : 0,
    TYPE_COMMENT : "COMMENT",
    TYPE_FILE : "FILE",
}

static async createNote({user_id,entity_id,remind_on,is_remind,note,variant,note_type,note_2}, con) {
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

static async updateNote({user_id,note_id,remind_on,is_remind,note,is_deleted,variant,note_type,note_2}, con) {
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

static async deleteNote({note_id}, con) {
    return await CommonNote.updateNote({note_id, is_deleted : CommonNote.CONSTANTS.DELETED_ON}, con);
}

static async getNote({ note_id }, con) {
    return (await mysql.query(con,
        `select cn.* 
           from common_note cn
          where cn.note_id = ?
            and is_deleted = 0`,
        [note_id]))[0];
}

static async getNoteList({user_id, entity_id, limit, offset}, con) {
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
static async getRemindNoteList({user_id, entity_tree, limit, offset}, con) {
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

    static async createWithTrigger(pginstance, {values,returning = null,on_conflict = null}) {
        const result = super.create(pginstance, {values,returning,on_conflict});
        if (!values.task_id) {
            return result;
        }

        // get task model before create
        const projectTaskModel = (await ProjectTask.find(pginstance, {where:{ 
            task_id : values.task_id
        }}))[0];

        const taskUrl = `https://planhelp.ru/project/${projectTaskModel.project_id}/task/${projectTaskModel.task_id}/`;
        let notifyText = "";
        const notifyUserSet = new Set();

        if (projectTaskModel.executor_id) notifyUserSet.add(projectTaskModel.executor_id);
        if (projectTaskModel.responsible_id) notifyUserSet.add(projectTaskModel.responsible_id);
        if (projectTaskModel.reviewer_id) notifyUserSet.add(projectTaskModel.reviewer_id);
        // get user model
        const userModel = (await RefUsers.find(pginstance,{where:{
            user_id : values.user_id
        }}))[0];

        notifyText = `${userModel.login} написал комментарий -> ${values.note} \n ${taskUrl} \n`;
        // уюираем юзера, который соверщил действие
        notifyUserSet.delete(values.user_id);

        // перебираем оставшихся и формируем нотификации
        notifyUserSet.forEach(async (user_id) => {
            const notify_id = await Notify.create(pginstance,{values:{
                user_id : user_id,
                object_id : values.task_id,
                object_type : "project_task",
                notify_note : notifyText,
                is_read : 0,
                created_on : {expression : "now()"}
            }});
            const userModel = (await RefUsers.find(pginstance,{where:{user_id}}))[0];
            if (userModel.telegram_chat_id && userModel.is_notify) {
                await NotifyTlgrm.create(pginstance, {values:{
                    notify_id : notify_id,
                    status : NotifyTlgrm.CONSTANTS.IN_QUEUE,
                    telegram_chat_id : userModel.telegram_chat_id
                }});
            }
        });
        
        return result;
    }
}

module.exports = CommonNote;