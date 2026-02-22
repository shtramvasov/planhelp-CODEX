const mysql = require('../mysqlhelper');
const userModel = require('../models/ref_users');
const ChatMessage = require('../models/chat_message');
const ChatUser = require('../models/chat_user');
const Chat = require('../models/chat');

const onMessage = async (webSocketServer, ws, message) => {
    switch (message.action) {
        case "auth":
            await auth(ws, message.token);
            break;
        case "msg":
            await msg(webSocketServer, ws, message.payload);
            break;
        case "msg_list":
            await msg_list(webSocketServer, ws, message.payload);
            break;
        default:
          
      }
}

const msg_list = async (webSocketServer, ws, {chat_id, offset_msg_id}) => {
    let con;
    try {
        con = await mysql.getConnection();

        const _custom = [];
        if (offset_msg_id) {
            _custom.push = {
                sql : `and chat_message.message_id > ${offset_msg_id}`,
                no_value : true 
            }
        };

        const chat_message_list = await ChatMessage.find(con, {
            select : "chat_message.*, ref_users.login",
            joins : [ 
                { table : "ref_users", on : "chat_message.user_id = ref_users.user_id" }
            ],
            where : {
                chat_id,
                _custom  
            },
            limit : 100,
            order : "message_id desc"
        });
        ws.send(JSON.stringify({chat_message_list : chat_message_list}));

    } catch(error) {
        console.log(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
}

// пришло сообщение
const msg = async (webSocketServer, ws, {chat_id, text}) => {
    console.log(webSocketServer);
    // проверка аутентифицирован ли сокет??
    // проверка прав на чат??

    let con;
    try {
        con = await mysql.getConnection();

        await ChatMessage.create(con, {
            values : {
                chat_id : chat_id,
                user_id : ws.userModel.user_id,
                message_text : text,
                created_at : {expression : "now()"},
                status : 0
            }
        });
        const chat_user_list = await ChatUser.find(con, {
            where : {
                chat_id
            }
        });

        await ChatUser.update(con, {
            values : {
                last_message_count : {expression : " last_message_count +1 "},
                last_message_at : {expression : "now()"},
            },
            where : {
                chat_id,
                _custom : [{
                    sql : ` and chat_user.user_id != ${ws.userModel.user_id} `, 
                    no_value : true 
                }]
            }
        });

        await Chat.update(con, {
            values : {
                last_message : text
            },
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
                if (client.userModel?.user_id == chat_user.user_id ) {
                    
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({
                            chat_message : {
                                chat_id : chat_id,
                                message_text : text,
                                login : ws.userModel.login,
                                created_at : new Date().toISOString()
                            }
                        }));
                    }    
                }
                
            });
        }

    } catch(error) {
        console.log(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }

    // // ws send
    // for (const client of webSocketServer.clients) {
        
    //     console.log(client);
    // }
    
}

// ауф соединения
const auth = async (ws, token) => {
    let con;
    try {
        con = await mysql.getConnection();

        const user = await userModel.getProfile({token}, con);
        if (!user) {
            ws.close();
            return;
        }
        console.log(`Socket authenticated successful with user id=${user.user_id}, and login=${user.login}`)
        ws.id = token;
        ws.userModel = user;
    } catch(error) {
        ws.close();
    } finally {
        con && await mysql.releaseConnection(con);
    }
}

module.exports = {
    onMessage
};