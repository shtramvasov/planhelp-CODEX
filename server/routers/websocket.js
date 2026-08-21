const withWsTransaction = require('./helper/withWsTransaction');
const userModel = require('../models/ref_users');
const ChatMessage = require('../models/chat_message');
const ChatUser = require('../models/chat_user');
const Chat = require('../models/chat');
const RefUsersTokens = require('../models/ref_users_tokens');
const mysql = require('../mysqlhelper');
const Android = require('../models/push/Android');
const Apple = require('../models/push/Apple');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
let wss;


const push_user_list = {
    // { user_id : [timer_id_1,timer_id_3,timer_id_3] }    
};

const onMessage = async (webSocketServer, ws, message) => {

    // message already as json
    
    // структура ожидаемого сообщения
    // {
    //     action : "some_action",
    //     action_id : "id some_action",
    //     payload : {
    //         // полезные данные, специфичные для каждого action
    //     }
    // }
    //

    try {

        if (!message.payload) {
            throw Error("payload is empty");
        }

        if (!message.action) {
            throw Error("action is empty");
        }

        if (!["auth","chat_message","chat_message_list","chat_list","chat_read_all","chat_message_delete", "chat_message_edit", "chat_typing" ].includes(message.action)) {
            throw Error("action is not allow");
        }

        // не требующие аутентификацию действия
        switch (message.action) {
            case "auth":
                await auth(webSocketServer, ws, message);
                break;
            default:  
        }

        if (!ws.userModel) {
            throw Error("connection is not authenticated");
        }
        // требующие аутентификацию действия
        switch (message.action) {
            case "chat_message":
                await chat_message(webSocketServer, ws, message);
                break;
            case "chat_message_list":
                await chat_message_list(webSocketServer, ws, message);
                break;
            case "chat_list":
                await chat_list(webSocketServer, ws, message);
                break;
            case "chat_read_all":
                await chat_read_all(webSocketServer, ws, message);
                break;
            case "chat_message_edit":
                await chat_message_edit(webSocketServer, ws, message);
                break;
            case "chat_message_delete":
                await chat_message_delete(webSocketServer, ws, message);
                break;
            case "chat_typing":
                await chat_typing(webSocketServer, ws, message);
                break;
            default:
            
        }
    } catch(error) {
        // тут основная обработка ошибок
        // много консолим чтобы если что выяснять
        console.log("==== ERROR STACK BEGIN===");
        console.log(ws.userModel);
        console.log(message);
        console.log(error);
        console.log("==== ERROR STACK END===");
        ws.send(JSON.stringify(
            {
                action_id : message.action_id,
                error : {
                    message : error.message
                }
            }
        ));
    }
}

// ауф соединения
const auth = withWsTransaction(async (webSocketServer, ws, {payload, action_id}, con) => {

    const { token } = payload;
    if (!token) {
        throw Error("authenticated is false");
    }

    const user = await userModel.getProfile({token}, con);
    if (!user) {
        throw Error("authenticated is false");
    }

    console.log(`Socket authenticated successful with user id=${user.user_id}, and login=${user.login}`)

    ws.id = token;
    ws.userModel = user;
    ws.send(JSON.stringify(
        {
            action_id : action_id,
            auth : {
                ok : true
            }
        }
    ));
    
});

// Прочитать все сообщения
const chat_read_all = withWsTransaction(async (webSocketServer, ws, {payload, action_id}, con) => {
    const { chat_id : request_chat_id} = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);

    // проверка прав юзера на этот чат
    const chat_user = await ChatUser.findOneOrFail(con, {
        where : {
            user_id : ws.userModel.user_id,
            chat_id : chat_id
        },
        error_text : "permission denied for this chat"
    });

    // если кол-во сообщений уже 0, то обновлять запись не будем
    if (chat_user.last_message_count != 0) {
        await ChatUser.update(con, {
            values: {
                last_message_count : 0
            },
            where : {
                chat_id,
                user_id : ws.userModel.user_id
            }
        });
    }

    // засылаем всем сокетам тек юзера что чат прочитан
    webSocketServer.clients.forEach((client) => {
        if (client.userModel?.user_id == ws.userModel.user_id && client.readyState === 1) {
            client.send(JSON.stringify(
                {
                        chat_id : request_chat_id,
                        action_id : action_id,
                        chat_read_all : { ok : true }
                }
            ));
        }
    });

    // cancel push
    if (push_user_list[ws.userModel.user_id]) {
        for (const timer_id of push_user_list[ws.userModel.user_id]) {
            clearTimeout(timer_id);
        }
    }

});

// список чатов
const chat_list = withWsTransaction(async (webSocketServer, ws, {payload, action_id}, con) => {

    const chat_list = await Chat.find(con, {
        joins : [ 
            { table : "chat_user", on : "chat.chat_id = chat_user.chat_id" },
        ],
        where : {
            "chat_user.user_id" : ws.userModel.user_id
        },
        // сортируем по последним событиям
        order : "chat_user.last_message_at desc"
    });
    
    for (const chat of chat_list) {
        // для всех чатов with_user_id по умолчанию null
        chat.with_user_id = null;
        if (chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL) {
            const chat_user_list = await ChatUser.find(con, {
                select : "ref_users.login, ref_users.username, ref_users.user_id, ref_users.avatar_url",
                joins : [
                    { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
                ],
                where : {
                    chat_id : chat.chat_id
                }
            });
            const chat_user = chat_user_list.find((chat_user) => chat_user.user_id != ws.userModel.user_id);
            if (chat_user) {
                // если чат персональный то названием чата выступает логин юзера
                chat.chat_name = chat_user.username ? chat_user.username : chat_user.login;
                chat.avatar_url = chat_user.avatar_url;
                // однако если чат персональный с юзером то пихнем его user_id в with_user_id
                // это надо для градиентов
                chat.with_user_id = chat_user.user_id;
                // chat.reply_user = chat_user;
            }
        }
    }
    ws.send(JSON.stringify(
        {
            action_id : action_id,
            chat_list : chat_list
        }
    ));

});

// список сообщений внутри чата
const chat_message_list = withWsTransaction(async (webSocketServer, ws, { payload, action_id }, con) => {
    // tmp solution for debug
    await sleep(400);
    const { chat_id : request_chat_id, offset_message_id } = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);

    const where = {
        chat_id,
        parent_message_id,
        _custom : []
    };

    // проверка прав на чат
    const chat_user = await ChatUser.findOneOrFail(con, {
        where : {
            user_id : ws.userModel.user_id,
            chat_id : chat_id
        },
        error_text : "permission denied for this chat"
    });

    const chat = await Chat.findOne(con, { where : { chat_id }});

    if (offset_message_id && Number.isInteger(+offset_message_id)) {
        where._custom.push({
            sql : `and chat_message.message_id < (:value:)`,
            value : offset_message_id
        });
    };

    if (chat.discussion_allow === Chat.CONSTANTS.DISCUSSION_ALLOW) {
        if (!parent_message_id) {
            where._custom.push({
                sql : `and chat_message.parent_message_id is null`,
                no_value : true 
            });
        }
    }

    const chat_message_list = await ChatMessage.find(con, {
        select : "chat_message.*, ref_users.login, ref_users.username, ref_users.avatar_url",
        joins : [ 
            { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
        ],
        where : where,
        limit : 100,
        order : "message_id desc"
    });

    for (const chat_message of chat_message_list) {
        if (chat_message.reply_message_id) {
            chat_message.reply_chat_message = await ChatMessage.findOne(con, {
                select : "chat_message.*, ref_users.login, ref_users.username, ref_users.avatar_url",
                joins : [ 
                    { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
                ],
                where : {
                    message_id : chat_message.reply_message_id
                }
            });
        }
    }

    ws.send(JSON.stringify(
        {
            action_id : action_id,
            chat_id : request_chat_id,
            chat_message_list : chat_message_list
        }
    ));

});

// пришло сообщение
const chat_message = withWsTransaction(async (webSocketServer, ws, { payload, action_id }, con) => {
    const { chat_id : request_chat_id, message_text, reply_message_id } = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);
    
    let parent_chat_message;
    let reply_chat_message;

    if (!message_text) {
        throw Error("message_text is empty");
    }
    // проверка прав на чат
    const chat_user = await ChatUser.findOneOrFail(con, {
        where : {
            user_id : ws.userModel.user_id,
            chat_id : chat_id
        },
        error_text : "permission denied for this chat"
    });

    const chat = await Chat.findOne(con, { where : { chat_id }});

    if (parent_message_id) {
        // проверим что родительского сообщение вобще существует / имеем к нему доступ
        parent_chat_message = await ChatMessage.findOneOrFail(con, {
            where : {
                chat_id : chat_id,
                message_id : parent_message_id
            },
            error_text : "permission denied for this parent_message_id or not exists"
        });

        await ChatMessage.update(con, {
            values : {
                child_message_count : {expression : " child_message_count +1 "}
            },
            where : {
                chat_id : chat_id,
                message_id : parent_message_id
            }
        });
    }

    if (reply_message_id) {
        if (!Number.isInteger(+reply_message_id)) {
            throw Error("reply_message_id is not valid numeric value");
        }
        // проверим что reply сообщение вобще существует / имеем к нему доступ
        reply_chat_message = await ChatMessage.findOneOrFail(con, {
            select : "chat_message.*, ref_users.login, ref_users.username, ref_users.avatar_url",
            joins : [ 
                { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
            ],
            where : {
                chat_id : chat_id,
                message_id : reply_message_id
            },
            error_text : "permission denied for this reply_message_id or not exists"
        });
    }

    // создаем сообщение в БД
    await ChatMessage.create(con, {
        values : {
            chat_id : chat_id,
            user_id : ws.userModel.user_id,
            message_text : message_text,
            created_at : {expression : "now()"},
            status : 0,
            parent_message_id,
            reply_message_id
        }
    });

    // и получаем ID
    const message_id = (await mysql.query(con,`select LAST_INSERT_ID() message_id`))[0].message_id;

    // обновляем у чата последнее сообщение в чате
    await Chat.update(con, {
        values : {
            last_message_id : message_id
        },
        where : {
            chat_id
        }
    });

    // другим юзерам
    await ChatUser.update(con, {
        values : {
            last_message_count : {expression : " last_message_count +1 "},
            last_message_at : {expression : "now()"},
        },
        where : {
            chat_id,
            _custom : [{
                sql : ` and chat_user.user_id != (:value:) `, 
                value : ws.userModel.user_id 
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
            user_id : ws.userModel.user_id
        }
    });

    await Chat.update(con, {
        values : {
            // TODO last_message_id 
            last_message : message_text.substr(0,127)
        },
        where : {
            chat_id
        }
    });
    
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
        webSocketServer.clients.forEach((client) => {
            if (client.userModel?.user_id == chat_user.user_id && client.readyState === 1) {

                const reply_user = chat_user_list.find((chat_user) => chat_user.user_id !== client.userModel?.user_id);

                client.send(JSON.stringify({
                    action_id : action_id,
                    chat_id : request_chat_id,
                    last_message : message_text.substr(0,127), //chat.last_message,
                    chat_name : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                                (reply_user.username ? reply_user.username : reply_user.login)
                                    : chat.chat_name,
                    last_message_at : chat_user.last_message_at,
                    last_message_count : chat_user.last_message_count,
                    notify_status : chat_user.notify_status,
                    chat_type : chat.chat_type,
                    discussion_allow : chat.discussion_allow,
                    avatar_url : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                                reply_user.avatar_url
                                    : chat.avatar_url,
                    with_user_id : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                                reply_user.user_id
                                    : null,
                    chat_message : {
                        parent_message_id : parent_message_id,
                        chat_id : request_chat_id,
                        user_id : ws.userModel.user_id,
                        message_text : message_text,
                        login : ws.userModel.login,
                        avatar_url : ws.userModel.avatar_url,
                        username : ws.userModel.username,
                        created_at : new Date().toISOString(),
                        updated_at : null,
                        message_id : message_id,
                        status : 0,
                        child_message_count : 0,
                        reply_chat_message : reply_chat_message
                    }
                })); 
            }
            
        });
    }

    // pushes
    const reply_user = chat_user_list.find((chat_user) => chat_user.user_id == ws.userModel?.user_id);
    for (const chat_user of chat_user_list) {
        if (chat_user.user_id == reply_user.user_id) {
            continue;
        }
        if (chat_user.notify_status == 0) {
            continue;
        }
        const chat_name = chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
            (reply_user.username ? reply_user.username : reply_user.login)
                : chat.chat_name;

        const timer_id = setTimeout(async () => {

            await sendPush({
                chat_id : request_chat_id,
                push_id : message_id,
                user_id : chat_user.user_id,
                push_title : chat_name,
                push_text : message_text.substr(0,127)
            })

        }, 6000);
        if (push_user_list[chat_user.user_id]) {
        } else {
            push_user_list[chat_user.user_id] = [];
        }
        push_user_list[chat_user.user_id].push(timer_id);
    }
});

const chat_message_edit = withWsTransaction(async (webSocketServer, ws, { payload, action_id }, con) => {
    const { chat_id : request_chat_id, message_text, message_id } = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);

    let reply_chat_message;

    if (!message_text) {
        throw Error("message_text is empty");
    }

    if (!message_id) {
        throw Error("message_id is empty");
    }

    // проверка прав на чат
    const chat_user = await ChatUser.findOneOrFail(con, {
        where : {
            user_id : ws.userModel.user_id,
            chat_id : chat_id
        },
        error_text : "permission denied for this chat"
    });

    const chat = await Chat.findOne(con, { where : { chat_id }});

    const chat_message = await ChatMessage.findOneOrFail(con, {
        where : {
            chat_id,
            message_id,
            user_id : ws.user_id // редачить могут только авторы сообщений
        },
        error_text : "permission denied for this message"
    });

    if (chat_message.reply_message_id) {
        reply_chat_message = await ChatMessage.findOne(con, {
            select : "chat_message.*, ref_users.login, ref_users.username, ref_users.avatar_url",
            joins : [ 
                { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
            ],
            where : {
                chat_id : chat_id,
                message_id : chat_message.reply_message_id
            }
        });
    }

    await ChatMessage.update(con, {
        values : {
            message_text,
            status : ChatMessage.CONSTANTS.EDITED
        },
        where : {
            chat_id,
            message_id
        }
    });

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
        webSocketServer.clients.forEach((client) => {
            // убрал это условие
            // && chat_user.user_id != ws.userModel.user_id
            // на сокет посылаем ВСЕМ, даже тому кто отправил сообщение
            if (client.userModel?.user_id == chat_user.user_id && client.readyState === 1) {

                const reply_user = chat_user_list.find((chat_user) => chat_user.user_id !== client.userModel?.user_id);

                client.send(JSON.stringify({
                    action_id : action_id,
                    chat_id : request_chat_id,
                    last_message : chat.last_message,
                    chat_name : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                        (reply_user.username ? reply_user.username : reply_user.login)
                        : chat.chat_name,
                    last_message_at : chat_user.last_message_at,
                    last_message_count : chat_user.last_message_count,
                    notify_status : chat_user.notify_status,
                    chat_type : chat.chat_type,
                    discussion_allow : chat.discussion_allow,
                    avatar_url : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                        reply_user.avatar_url
                        : chat.avatar_url,
                    with_user_id : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                                reply_user.user_id
                                    : null,
                    chat_message : {
                        parent_message_id : parent_message_id,
                        chat_id : request_chat_id,
                        user_id : ws.userModel.user_id,
                        message_text : message_text,
                        login : ws.userModel.login,
                        avatar_url : ws.userModel.avatar_url,
                        username : ws.userModel.username,
                        created_at : new Date().toISOString(),
                        updated_at : null,
                        message_id : message_id,
                        status : ChatMessage.CONSTANTS.EDITED,
                        child_message_count : chat_message.child_message_count,
                        reply_chat_message : reply_chat_message
                    }
                }));
            }    
        });
    }
});

const chat_message_delete = withWsTransaction(async (webSocketServer, ws, { payload, action_id }, con) => {

    const { chat_id : request_chat_id, message_id } = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);

    let reply_chat_message;

    if (!message_id) {
        throw Error("message_id is empty");
    }

    // проверка прав на чат
    const chat_user = await ChatUser.findOneOrFail(con, {
        where : {
            user_id : ws.userModel.user_id,
            chat_id : chat_id
        },
        error_text : "permission denied for this chat"
    });

    const chat_message = await ChatMessage.findOneOrFail(con, {
        where : {
            chat_id,
            message_id,
            user_id : ws.user_id // удалять могут только авторы сообщений
        },
        error_text : "permission denied for this message"
    });

    if (chat_message.reply_message_id) {
        reply_chat_message = await ChatMessage.findOne(con, {
            select : "chat_message.*, ref_users.login, ref_users.username, ref_users.avatar_url",
            joins : [ 
                { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
            ],
            where : {
                chat_id : chat_id,
                message_id : chat_message.reply_message_id
            }
        });
    }

    const chat = await Chat.findOne(con, { where : { chat_id }});

    if (chat.last_message_id == message_id) {
        // если удаляется сообщение, которое было последним то не паримся
        await Chat.update(con, {
            values : {
                last_message_id : null
            },
            where : {
                chat_id
            }
        });
    }

    await ChatMessage.delete(con, {
        where : {
            chat_id,
            message_id
        }
    });

    if (parent_message_id) {

        // проверим что родительского сообщение вобще существует / имеем к нему доступ
        await ChatMessage.findOneOrFail(con, {
            where : {
                chat_id : chat_id,
                message_id : parent_message_id
            },
            error_text : "permission denied for this parent_message_id"
        });

        await ChatMessage.update(con, {
            values : {
                child_message_count : {expression : " child_message_count -1 "}
            },
            where : {
                message_id : parent_message_id
            }
        });
    }
    
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
        webSocketServer.clients.forEach((client) => {
            // убрал это условие
            // && chat_user.user_id != ws.userModel.user_id
            // на сокет посылаем ВСЕМ, даже тому кто отправил сообщение
            if (client.userModel?.user_id == chat_user.user_id && client.readyState === 1) {

                const reply_user = chat_user_list.find((chat_user) => chat_user.user_id !== client.userModel?.user_id);

                client.send(JSON.stringify({
                    action_id : action_id,
                    chat_id : request_chat_id,
                    last_message : chat.last_message,
                    chat_name : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                        (reply_user.username ? reply_user.username : reply_user.login)
                        : chat.chat_name,
                    last_message_at : chat_user.last_message_at,
                    last_message_count : chat_user.last_message_count,
                    notify_status : chat_user.notify_status,
                    chat_type : chat.chat_type,
                    discussion_allow : chat.discussion_allow,
                    avatar_url : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                        reply_user.avatar_url
                        : chat.avatar_url,
                    with_user_id : chat.chat_type == Chat.CONSTANTS.TYPE_PERSONAL ? 
                        reply_user.user_id
                            : null,
                    chat_message : {
                        parent_message_id : parent_message_id,
                        chat_id : chat_id,
                        user_id : ws.userModel.user_id,
                        message_text : "Сообщение удалено",
                        login : ws.userModel.login,
                        avatar_url : ws.userModel.avatar_url,
                        username : ws.userModel.username,
                        created_at : new Date().toISOString(),
                        updated_at : null,
                        message_id : message_id,
                        status : ChatMessage.CONSTANTS.DELETED,
                        child_message_count : 0,
                        reply_chat_message : reply_chat_message
                    }
                }));   
            }
        });
    }
});

const chat_typing = withWsTransaction(async (webSocketServer, ws, { payload, action_id }, con) => {
    const { chat_id : request_chat_id } = payload;
    const { chat_id, parent_message_id } = splitCompositeChatId(request_chat_id);

    const chat_user_list = await ChatUser.find(con, {
        joins : [
            { table : "ref_users", on : "chat_user.user_id = ref_users.user_id" }
        ],
        where : {
            chat_id
        }
    });
    
    // проверка прав на чат
    const chat_user = chat_user_list.find((chat_user) => {
        return chat_user.user_id == ws.userModel.user_id;
    })
    if (!chat_user) {
        // если нет прав на чат
        throw Error("permission denied for this chat");
    }

    for (const chat_user of chat_user_list) {
        webSocketServer.clients.forEach((client) => {
            // убрал это условие
            // && chat_user.user_id != ws.userModel.user_id
            // на сокет посылаем ВСЕМ, даже тому кто отправил сообщение
            if (client.userModel?.user_id == chat_user.user_id && chat_user.user_id != ws.userModel.user_id && client.readyState === 1) {
                    
                client.send(JSON.stringify(
                    {
                        chat_id : request_chat_id,
                        chat_typing : {
                            user_id : ws.userModel.user_id,
                            login : ws.userModel.login,
                            username : ws.userModel.username
                        }
                    }
                ));

            }
        })
    }
});


const sendPush = async ({chat_id, push_id, user_id, push_title, push_text}) => {
    let dbinstance;

    const push = {
        chat_id, 
        title : push_title, 
        text : push_text, 
        message_id : push_id, 
        // token_push : req.userModel.push_token,
        action_type : "chat"
    }

    try {
        dbinstance = await mysql.getConnection();
        const ref_users_tokens_list = await RefUsersTokens.find(dbinstance, {
            where : {
                user_id,
                is_deleted : "N",
                _custom : [
                    {
                        sql : `and dev_type in ('A','I')`,
                        no_value : true 
                    },
                    {
                        sql : `and created_at is not null`,
                        no_value : true 
                    }
                ]
            },
            order: 'created_at desc',
            limit: 3,
        });
        let resp;
        for (const ref_users_tokens of ref_users_tokens_list) {
            push.token_push = ref_users_tokens.push_token;
            if (ref_users_tokens.dev_type == 'A') {
                const token = await Android.getToken({brandcode : 'PLANHELP'});
                push.token = token;
                resp = await Android.send(push);
            } else
            if (ref_users_tokens.dev_type == 'I') {
                resp = await Apple.send(push);
            }
            console.log(`push_id=${push_id} for user_id = ${user_id} title=${push_title} text=${push_text.substr(0,127)}`);
        }
        console.log("resp:",resp);
    } catch(err) {
        console.log(err);
    } finally {
        dbinstance && await mysql.releaseConnection(dbinstance);
    }  
}

// ========== HELPERS ============

// формат chat_id 
// либо это идчата
// либо это идчата_идродительскогосообщения
const splitCompositeChatId = (request_chat_id) => {
    let chat_id;
    let parent_message_id;
    
    if (request_chat_id.split("_").length == 1) {
        // если при сплите _ 1 элемент - значит это и есть нужный чат
        chat_id = request_chat_id;
    } else 
    if (request_chat_id.split("_").length == 2){
        // если при сплите _ 2 элемента - значит это чат + ид род собщения
        const split = request_chat_id.split("_");
        
        chat_id = split[0];
        parent_message_id = split[1];
    }

    if (!chat_id) {
        throw Error("chat_id is empty");
    }

    if (!Number.isInteger(+chat_id)) {
        throw Error("chat_id is not valid numeric value");
    }

    if (parent_message_id) {
        if (!Number.isInteger(+parent_message_id)) {
            throw Error("parent_message_id is not valid numeric value");
        }
    }

    return { chat_id, parent_message_id }
}

module.exports = {
    onMessage,
    setWebSocketServer : (webSocketServer) => { wss = webSocketServer },
    getWebSocketServer : () => {return wss}
};