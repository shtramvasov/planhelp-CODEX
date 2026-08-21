var express = require('express');
var router = express.Router();
const withTransaction = require('./helper/withTransaction');
const { validateChatOwner } = require('./helper/middleware/chatValidate');
const Chat = require('../models/chat');
const { TYPE_GROUP, TYPE_PERSONAL } = require('../models/chat').CONSTANTS;
const ChatUser = require('../models/chat_user');
const ChatMessage = require('../models/chat_message');
const { READ, WRITE, OWNER } = require('../models/chat_user').CONSTANTS;
const { webSocketServer } = require('../routers/websocket');
var mysql = require('../mysqlhelper');
const websocket = require('../routers/websocket');
const Android = require('../models/push/Android');
const Apple = require('../models/push/Apple');

// Список чатов
// перенесено в сокет
// router.get('/', withTransaction(async (req, res, next) => {
//     const con = res.locals.dbinstance;
//     const { user_id } = req.userModel;

//     const chat_list = await Chat.find(con, {
//         joins : [ 
//             { table : "chat_user", on : "chat.chat_id = chat_user.chat_id" },
//             // { type : "left join", table : "chat_user personal_chat_user", on : "chat.chat_id = personal_chat_user.chat_id and chat.chat_type = 1" },
//             // { type : "left join", table : "ref_users", on : "personal_chat_user.user_id = ref_users.user_id" }
//         ],
//         where : {
//             "chat_user.user_id" : user_id
//         },
//         // сортируем по последним событиям
//         order : "chat_user.last_message_at desc"
//     });
    
//     for (const chat of chat_list) {
//         if (chat.chat_type == TYPE_PERSONAL) {
//             const chat_user_list = await ChatUser.find(con, {
//                 joins : [
//                     { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
//                 ],
//                 where : {
//                     chat_id : chat.chat_id
//                 }
//             });
//             const chat_user = chat_user_list.find((chat_user) => chat_user.user_id != req.userModel.user_id);
//             if (chat_user) {
//                 chat.chat_name = await chat_user.login;
//             }
//         }
//     }

//     res.send(chat_list);
// }));

router.post('/push', withTransaction(async (req, res, next) => {
    // console.log(req.userModel);
    const { chat_id, title, text, message_id } = req.body;

    const push = {
        chat_id, 
        title, 
        text, 
        message_id, 
        token_push : req.userModel.push_token,
        action_type : "chat"
    }

    if (!req.userModel.push_token) {
        throw Error("no push_token for this device");
    }

    if (!req.userModel.dev_type) {
        throw Error("unknow dev_type for this device");
    }

    let resp = {};
    if (req.userModel.dev_type == 'A') {
        const token = await Android.getToken({brandcode : 'PLANHELP'});
        push.token = token;
        resp = await Android.send(push);
    } else
    if (req.userModel.dev_type == 'I') {
        resp = await Apple.send(push);
    }

    res.send(resp);
}));

// Детали чата
router.get('/:chat_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;

    let chat = (await Chat.find(con, {
        where : {
            chat_id
        }
    }))[0];

    if (!chat) throw 'Permission denied';

    const chatUser = (await ChatUser.find(con, {
        where : {
            chat_id,
            user_id
        }
    }))[0];

    if (!chatUser) throw 'Permission denied';
    
    chat = {...chat, ...chatUser};

    const chat_user_list = await ChatUser.find(con, {
        select : "chat_user.*, ref_users.login, ref_users.user_id, ref_users.avatar_url, ref_users.username",
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
router.post('/:chat_id', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id } = req.userModel;
    const { chat_id } = req.params;
    const { chat_name, notify_status, discussion_allow } = req.body;

    const chat_user = (await ChatUser.find(con, {
        where : {
            user_id,
            chat_id
        }
    }))[0];

    if (!chat_user) throw 'Permission denied';
    
    // меняем то что разрешено самому юзеру, его сущность чата
    if ([Chat.CONSTANTS.NOTIFY_MUTE,Chat.CONSTANTS.NOTIFY_NORMAL].includes(notify_status)) {
        await ChatUser.update(con, {
            values : {
                notify_status
            },
            where : {
                chat_id,
                user_id
            }
        });
    }

    // а тут проверка на OWNER
    if (chat_name || discussion_allow != undefined) {
    
        if (chat_user.user_role !== OWNER) throw 'Permission denied, you are not OWNER of this chat';

        if (chat_name) {
            await Chat.update(con, {
                values : {
                    chat_name
                },
                where : {
                    chat_id
                }
            });
        }

        console.log("discussion_allow", discussion_allow);
        if ([Chat.CONSTANTS.DISCUSSION_ALLOW,Chat.CONSTANTS.DISCUSSION_DISALLOW].includes(discussion_allow)) {
            await Chat.update(con, {
                values : {
                    discussion_allow
                },
                where : {
                    chat_id
                }
            });
        }
    }
    res.send({ok:true});
}));

// Добавить юзера в чат
router.post('/:chat_id/user', withTransaction(validateChatOwner, async (req, res, next) => {
    const con = res.locals.dbinstance;
    
    const { user_id, user_role } = req.body;
    const { chat_id } = req.params;

    const chat = (await Chat.find(con, {
        where : {
            chat_id
        }
    }))[0];

    if (chat.chat_type === Chat.CONSTANTS.TYPE_PERSONAL) {
        throw Error('chat is personal only, not grouped');
    }

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

// Добавить cообщение в чат
router.post('/:chat_id/message', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const wss = websocket.getWebSocketServer();
    const { chat_id } = req.params;

    const { message_text, action_id } = req.body;

    const chat_user = (await ChatUser.find(con, {
        where : {
            user_id : req.userModel.user_id,
            chat_id : chat_id
        }
    }))[0];

    if (!chat_user) {
        // если нет прав на чат
        if (!chat_user) throw 'Permission denied';
    }

    await ChatMessage.create(con, {
        values : {
            chat_id : chat_id,
            user_id : req.userModel.user_id,
            message_text : message_text,
            created_at : {expression : "now()"},
            status : 0
        }
    });
    const message_id = (await mysql.query(con,`select LAST_INSERT_ID() message_id`))[0].message_id;

    // другим юзерам
    await ChatUser.update(con, {
        values : {
            last_message_count : {expression : " last_message_count +1 "},
            last_message_at : {expression : "now()"},
        },
        where : {
            chat_id,
            _custom : [{
                sql : ` and chat_user.user_id != ${req.userModel.user_id} `, 
                no_value : true 
            }]
        }
    });

    // себе
    await ChatUser.update(con, {
        values : {
            last_message_count : 0,
            last_message_at : {expression : "now()"},
        },
        where : {
            chat_id,
            user_id : req.userModel.user_id
        }
    });
    
    await Chat.update(con, {
        values : {
            last_message : message_text.substr(0,127)
        },
        where : {
            chat_id
        }
    });
    
    const chat = (await Chat.find(con, {
        where : {
            chat_id
        }
    }))[0];


    const chat_user_list = await ChatUser.find(con, {
        joins : [
            { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
        ],
        where : {
            chat_id
        }
    });

    // хуева оптимизированна
    for (const chat_user of chat_user_list) {
        wss.clients.forEach((client) => {
            // убрал это условие
            // && chat_user.user_id != ws.userModel.user_id
            // на сокет посылаем ВСЕМ, даже тому кто отправил сообщение
            if (client.userModel?.user_id == chat_user.user_id ) {
                
                if (client.readyState === 1) {

                    const reply_user = chat_user_list.find((chat_user) => chat_user.user_id !== client.userModel?.user_id);

                    client.send(JSON.stringify({
                        action_id : action_id,
                        chat_id : chat_id,
                        last_message : chat.last_message,
                        chat_name : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                            (reply_user.username ? reply_user.username : reply_user.login)
                            : chat.chat_name,
                        last_message_at : chat_user.last_message_at,
                        last_message_count : chat_user.last_message_count,
                        chat_type : chat.chat_type,
                        notify_status : chat_user.notify_status,
                        avatar_url : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                                reply_user.avatar_url
                                : chat.avatar_url,
                        chat_message : {
			    username : req.userModel.username,
			    avatar_url : req.userModel.avatar_url,
                            chat_id : chat_id,
                            user_id : req.userModel.user_id,
                            message_text : message_text,
                            login : req.userModel.login,
                            created_at : new Date().toISOString(),
                            updated_at : null,
                            message_id : message_id,
                            status : 0
                        }
                    }));
                }    
            }
            
        });
    }

    res.send({ok:true});
}));

module.exports = router;