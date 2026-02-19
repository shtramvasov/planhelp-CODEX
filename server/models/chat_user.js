const Model = require('./Model');

class ChatUser extends Model {
    
    static CONSTANTS = {
        // роль только читать
        READ : "READ",
        // роль писать но не управлять
        WRITE : "WRITE",
        // роль владелец, может все, добавить / удалить юзеров и тп
        OWNER : "OWNER"
    }

    static table = "chat_user";

}



module.exports = ChatUser;