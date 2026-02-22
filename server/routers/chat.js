var express = require('express');
var router = express.Router();
const withTransaction = require('./helper/withTransaction');
const { validateChatOwner } = require('./helper/middleware/chatValidate');
const Chat = require('../models/chat');
const { TYPE_GROUP, TYPE_PERSONAL } = require('../models/chat').CONSTANTS;
const ChatUser = require('../models/chat_user');
const ChatMessage = require('../models/chat_message');
const { READ, WRITE, OWNER } = require('../models/chat_user').CONSTANTS;

// Список чатов
router.get('/', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;

    const chat_list = await Chat.find(con, {
        joins : [ 
            { table : "chat_user", on : "chat.chat_id = chat_user.chat_id" },
            // { type : "left join", table : "chat_user personal_chat_user", on : "chat.chat_id = personal_chat_user.chat_id and chat.chat_type = 1" },
            // { type : "left join", table : "ref_users", on : "personal_chat_user.user_id = ref_users.user_id" }
        ],
        where : {
            "chat_user.user_id" : user_id
        },
        // сортируем по последним событиям
        order : "chat_user.last_message_at desc"
    });
    
    for (const chat of chat_list) {
        if (chat.chat_type == TYPE_PERSONAL) {
            const chat_user_list = await ChatUser.find(con, {
                joins : [
                    { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
                ],
                where : {
                    chat_id : chat.chat_id
                }
            });
            const chat_user = chat_user_list.find((chat_user) => chat_user.user_id != req.userModel.user_id);
            if (chat_user) {
                chat.chat_name = await chat_user.login;
            }
        }
    }

    res.send(chat_list);
}));

// Детали чата
router.get('/:chat_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;

    const chat = (await Chat.find(con, {
        where : {
            chat_id
        }
    }))[0];

    if (!chat) throw 'Permission denied';

    const chat_user_list = await ChatUser.find(con, {
        select : "chat_user.*, ref_users.login",
        joins : [ 
            { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
        ],
        where : {
            chat_id
        }
    });

    chat.chat_user_list = chat_user_list;

    res.send(chat);
}));

// Создать чат
router.post('/', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { chat_name, chat_type, user_id } = req.body;

    if (![TYPE_GROUP, TYPE_PERSONAL].includes(chat_type)) {
        throw Error("Invalid chat_type")
    }

    const chat_id = await Chat.create(con, {
        values : {
            chat_name,
            chat_type
        }
    });

    if (user_id) {
        await ChatUser.create(con, {
            values : {
                chat_id,
                user_id,
                user_role : OWNER,
                // сразу делаем now(), чтобы чат оказался наверху списка
                last_message_at : { expression : "now()" }
            }
        });
    }

    await ChatUser.create(con, {
        values : {
            chat_id,
            user_id : req.userModel.user_id,
            user_role : OWNER,
            // сразу делаем now(), чтобы чат оказался наверху списка
            last_message_at : { expression : "now()" }
        }
    });

    res.send({
        chat_id
    });
}));


// Удалить чат
router.delete('/:chat_id', withTransaction(validateChatOwner, async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;
    
    // просто чистим таблицу ChatUser
    await ChatUser.delete(con, {
        where : {
            chat_id
        }
    });

    res.send({ok:true});
}));


// Выйти из чата
router.delete('/:chat_id/leave', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;

    // подумать над тем, чтобы права owner передавать?

    // const chat_user_list = ChatUser.find(con, {
    //     where : {
    //         chat_id
    //     }
    // });

    // // чекаем есть ли юзер в текущем чате вобще ?
    // const current_user = chat_user_list.find((user) => {
    //     if (user.user_id === user_id) {
    //         return true;
    //     }
    // })
    // if (!current_user) throw 'Permission denied';
    

    // просто чистим таблицу ChatUser
    await ChatUser.delete(con, {
        where : {
            chat_id,
            user_id
        }
    });

    res.send({ok:true});
}));

// Изменить чат
router.post('/:chat_id', withTransaction(validateChatOwner, async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;
    const { chat_name } = req.body;

    await Chat.update(con, {
        values : {
            chat_name
        },
        where : {
            chat_id
        }
    })

    res.send({ok:true});
}));

// Добавить юзера в чат
router.post('/:chat_id/user', withTransaction(validateChatOwner, async (req, res, next) => {
    const con = res.locals.dbinstance;
    
    const { user_id, user_role } = req.body;
    const { chat_id } = req.params;

    await ChatUser.create(con, {
        values : {
            chat_id,
            user_role,
            user_id
        }
    });

    res.send({ok:true});
}));
// Удалить юзера из чата
router.delete('/:chat_id/user/:user_id', withTransaction(validateChatOwner, async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id, chat_id } = req.params;

    await ChatUser.delete(con, {
        where : {
            chat_id,
            user_id
        }
    })

    res.send({ok:true});
}));

// изменить юзера в чате
router.post('/:chat_id/user/:user_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;

    // сделаю потом, тк можно удалить / добавить заново

    res.send({ok:true});
}));

module.exports = router;