const mysql = require('../mysqlhelper');

const createNotify = async ({user_id, notify_note, object_id, object_type}, con) => {
    return await mysql.query(con,
        `insert into notify
            (user_id, notify_note, object_id, object_type, created_on)
         values(?,?,?,?,now)`,
        [user_id, notify_note, object_id, object_type]);
}

const getNotifyList = async ({user_id, limit, offset}, con) => {
    return await mysql.query(con,
        `select n.* 
           from notify n
          where n.user_id = ?
          order by n.notify_id desc
          limit ${limit} offset ${offset}`,
          [user_id]
    )
}

const getNotify = async ({user_id, notify_id},con) => {
    return (await mysql.query(con,
        `select n.* 
           from notify n
          where n.user_id = ?
            and n.notify_id = ?
          `,
          [user_id,notify_id])
    )[0]
}

const updateNotify = async ({notify_id, user_id, is_read}, con) => {
    
}

const readAllNotify = async ({user_id}, con) => {
    return await mysql.query(con,
        `update notify set is_read = 1 where user_id = ? and is_read = 0`, 
    [user_id]);
}

module.exports = {
    createNotify,
    updateNotify,
    getNotifyList,
    getNotify,
    readAllNotify
};