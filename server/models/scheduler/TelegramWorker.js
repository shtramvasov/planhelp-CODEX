const JobScheduler = require('./JobScheduler');
const mysql = require('../../mysqlhelper');
const fetch = require('node-fetch');
const config = require('../../config');

class TelegramWorker extends JobScheduler {
    async onRun(success,failure) {
        let con;
        try {
            con = await mysql.getConnection();
            await mysql.begin(con);
            const telegramNotifyList = await mysql.query(con, 
                `select nt.*, 
                        n.notify_note
                   from notify_tlgrm nt 
                        inner join notify n on nt.notify_id = n.notify_id
                  where nt.status = 0
                  limit 50`,[]);
            telegramNotifyList.length && console.log(`Found ${telegramNotifyList.length} for send`);
            for (const telegramNotify of telegramNotifyList) {
                const response = await fetch(`${config.telegram_bot_url}sendMessage?parse_mode=HTML&chat_id=${telegramNotify.telegram_chat_id}&text=${encodeURI(telegramNotify.notify_note)}`);
                console.log(response.status);
                await mysql.query(con, 
                        `update notify_tlgrm set status = 1 where notify_id = ?`, [ telegramNotify.notify_id ])
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
    instance : new TelegramWorker()
  }