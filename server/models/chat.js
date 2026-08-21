const Model = require('./Model');

class Chat extends Model {
    
    static table = "chat";

    static CONSTANTS = {
        // чат 1 на 1
        TYPE_PERSONAL : 1,
        // групповой чат    
        TYPE_GROUP : 2,
        // уведомления нормальные
        NOTIFY_NORMAL : 1,
        // уведомления муттед
        NOTIFY_MUTE : 0,
        // 
        DISCUSSION_ALLOW : 1,
        DISCUSSION_DISALLOW : 0,
    }

}


module.exports = Chat;