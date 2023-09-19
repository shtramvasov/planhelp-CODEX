const mysql = require('../mysqlhelper');
const Model = require('./Model');

class Notify extends Model {

    static CONSTANTS = {
        READED : 1,
        NOT_READED : 0
    }

    static fields = [
        "notify_id",
        "user_id",
        "object_id",
        "object_type",
        "notify_note",
        "is_read",
        "created_on"
    ]

    static table = "notify";

static async createNotify({user_id, notify_note, object_id, object_type}, con) {
    return await mysql.query(con,
        `insert into notify
            (user_id, notify_note, object_id, object_type, created_on)
         values(?,?,?,?,now)`,
        [user_id, notify_note, object_id, object_type]);
}

static async getNotifyList({user_id, limit, offset}, con) {
    return await mysql.query(con,
        `select n.*,
                case when n.object_type = 'project_task' then
                (select project_id from project_task where task_id = n.object_id)
                end project_id
           from notify n
          where n.user_id = ?
          order by n.notify_id desc
          limit ${limit} offset ${offset}`,
          [user_id]
    )
}

static async getNotify({user_id, notify_id},con) {
    return (await mysql.query(con,
        `select n.* 
           from notify n
          where n.user_id = ?
            and n.notify_id = ?
          `,
          [user_id,notify_id])
    )[0]
}

static async readAllNotify({user_id}, con) {
    return await mysql.query(con,
        `update notify set is_read = 1 where user_id = ? and is_read = 0`, 
    [user_id]);
}

}

module.exports = Notify;