const Model = require('./Model');

class ChatMessage extends Model {
    
    static table = "chat_message";

    static CONSTANTS = {
        // обычное сообщение
        NORMAL : 0,
        // отредактированное сообщение
        EDITED : 1,
        // удаленное сообщение
        DELETED : 2
    }

}


module.exports = ChatMessage;