const ChatUser = require('../../../models/chat_user');
const { READ, WRITE, OWNER } = require('../../../models/chat_user').CONSTANTS;

const validateChatOwner = async (req,res) => {

    const con = res.locals.dbinstance;
    const { chat_id } = req.params;
    const { user_id } = req.userModel;
    
    const chat_user = (await ChatUser.find(con, {
        where : {
            user_id,
            chat_id
        }
    }))[0];

    if (!chat_user) throw 'Permission denied';
    if (chat_user.user_role !== OWNER) throw 'Permission denied, you are not OWNER of this chat';

}

module.exports = {
    validateChatOwner
}