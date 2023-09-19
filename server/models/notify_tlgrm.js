const Model = require('./Model');

class NotifyTlgrm extends Model {

    static CONSTANTS = {
        IN_QUEUE : 0,
        SENDED : 1
    }
    
    static fields = [
        "notify_id",
        "status",
        "telegram_chat_id"
    ]

    static table = "notify_tlgrm";
}


module.exports = NotifyTlgrm;