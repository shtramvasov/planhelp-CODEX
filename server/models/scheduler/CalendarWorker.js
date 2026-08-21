const JobScheduler = require('./JobScheduler');
const mysql = require('../../mysqlhelper');
const fetch = require('node-fetch');
const config = require('../../config');

class CalendarWorker extends JobScheduler {
    async onRun(success,failure) {
        let con;
        try {
            con = await mysql.getConnection();
            await mysql.begin(con);
            // убрал условие
            // and de.is_deleted = 'N'
            const calendarList = await mysql.query(con, 
                `select de.entity_name,
                        de.entity_id, 
                        cn.note, 
                        cn.remind_on, 
                        cn.note_id, 
                        cn.user_id,
                        u.is_notify,
                        u.telegram_chat_id
                   from common_note cn inner join ref_users u on cn.user_id = u.user_id
                                        left join disk_entity de on cn.entity_id = de.entity_id  
                                       
                  where is_remind = 1 
                    and remind_on is not null
                    and cn.is_deleted = 0
                    and remind_on < now()
                  limit 50`,[]);
            calendarList.length && console.log(`Found ${calendarList.length} for calendar job`);
            for (const calendar of calendarList) {
                let notify = `Напоминание: ${calendar.note}`;

                //TEST THIS
                if (calendar.entity_id) {
                    notify += ` в ${calendar.entity_name}`;
                }
                
                await mysql.query(con,
                    `insert into notify(user_id,object_id,object_type,notify_note,is_read,created_on)
                    values(?,?,'disk_entity',?,0,now())`,
                    [ calendar.user_id, calendar.entity_id, notify ]);

                if (calendar.is_notify && calendar.telegram_chat_id) {
                    // Получаем созданный ID
                    const notify_id = (await mysql.query(con,`select LAST_INSERT_ID() notify_id`))[0].notify_id;
                    // пишем в журнал отправки для телеграм
                    await mysql.query(con,
                        `insert into notify_tlgrm(notify_id, status, telegram_chat_id)
                        values(?,0,?)`,
                        [ notify_id, calendar.telegram_chat_id ]
                    );
                }

                await mysql.query(con, 
                        `update common_note set is_remind = 0 where note_id = ?`, [ calendar.note_id ]);
            }
            success();
        } catch(err) {
            con && await mysql.rollback(con);
            failure(err);
        } finally {
            con && await mysql.commit(con) && await mysql.releaseConnection(con);
        }
    }
}

module.exports = {
    instance : new CalendarWorker()
  }