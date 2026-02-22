const Model = require('./Model');

class Chat extends Model {
    
    static table = "chat";

    static CONSTANTS = {
        // чат 1 на 1
        TYPE_PERSONAL : 1,
        // групповой чат    
        TYPE_GROUP : 2
    }

}


module.exports = Chat;