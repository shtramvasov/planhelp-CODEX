import { createSlice } from '@reduxjs/toolkit'

export const chatSlice = createSlice({
    name: 'Chat',
    initialState: {
        chatDialogList : [],
        chatDialog : {
            chat_id: null,
            chat_name: "",
            last_message: "",
            last_user_id: null,
            chat_type : null,
            notify_status : null,
            discussion_allow : null,
            chat_user_list : [],
        },
        chatDialogMessageList : {
            // chat_id значение : [ ..массив сообщений ]
            // например { 25 : [{},{},{} ...] }
        },
        chatDialogStates : {
            // chat_id: {
            // isAllMessagesLoaded : false,
            // isLoading : false
            // chatTyping : {user_id, login, username}
            // 
            // }
        },
        // { roma: true, predeinay: true }
        onLineClients : {

        }
    },
    reducers: {
        addChatDialog: (state, action) => {
            state.chatDialog = (action.payload);
        },
        addChatDialogList: (state, action) => {
            state.chatDialogList = (action.payload);
        },
        addChatChatDialogMesageList : (state, action) => {
            const { chat_id, chat_message_list } = action.payload;
            // найдем нужный диалог, если он есть
            if (chat_message_list.length > 0) {
                  const existingMessages = state.chatDialogMessageList[chat_id] || [];
                  const existingIds = new Set(existingMessages.map(msg => msg.message_id));

                  const newMessages = chat_message_list.filter(msg => !existingIds.has(msg.message_id));

                  if (newMessages.length === 0) return;
    
                  state.chatDialogMessageList[chat_id] = [...newMessages.reverse(), ...existingMessages];
                // const message_list = state.chatDialogMessageList[chat_id] ? state.chatDialogMessageList[chat_id] : [];
                // state.chatDialogMessageList[chat_id] = [...chat_message_list.reverse(), ...message_list]
            } else {
                // если пришло 0 сообщений помечаем что грузить дальше нет смысла
                // const chatDialog = state.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);
                // chatDialog.isAllMessagesLoaded = true;
            }
        },
        appendChatDialogMessage : (state, action) => {
            const { chat_id, chat_message } = action.payload;
            // для каждого чата отдельный стейт под список сообщений
            if (!state.chatDialogMessageList[chat_id]) {
                state.chatDialogMessageList[chat_id] = [];
            }
            // сначала попытаемся найти сообщение уже в массиве
            const exists_chat_message = state.chatDialogMessageList[chat_id].find((el) => el.message_id == chat_message.message_id);
            if (exists_chat_message) {
                // на случай, изменения или удаления сообщения
                exists_chat_message.message_text = chat_message.message_text;
                exists_chat_message.status = chat_message.status;
            } else {
                // если не нашли - пушим новое в массив
                state.chatDialogMessageList[chat_id].push(chat_message);
            }
            // ищем диалог среди загруженных диалогов, чтобы пододвинуть чат наверх
            let indexFrom=0;
            for(const chatDialog of state.chatDialogList) {
                if (chatDialog.chat_id == chat_id.split("_")[0]) {
                    break;
                }
                indexFrom++;
            }
            // наверное это не надо делать для статусов удаления сообщений / изменения
            let indexTo=0;
            state.chatDialogList.splice(indexFrom,1);
            // создаем объект
            state.chatDialogList.splice(indexTo,0,{...action.payload, chat_id : chat_id.split("_")[0]});
            
            if (chat_id.split("_").length > 1) {
                // значит это сообщение в чат дискуссии
                // надо найти это сообщение и увеличит кол-во счетчиков
                const exists_parent_chat_message = state.chatDialogMessageList[chat_id.split("_")[0]]?.find((el) => el.message_id == chat_message.parent_message_id);
                if (exists_parent_chat_message) {
                    if (chat_message.status == 0) {
                        exists_parent_chat_message.child_message_count = Number(exists_parent_chat_message.child_message_count)+1;
                        exists_parent_chat_message.extraVariant = "warning";
                    } else 
                    if (chat_message.status == 2) {
                        exists_parent_chat_message.child_message_count = Number(exists_parent_chat_message.child_message_count)-1;
                        exists_parent_chat_message.extraVariant = "warning";
                    }
                }
            }

        },
        clearExtraVariant : (state, action) => {
            const { chat_id } = action.payload;
            if (chat_id && chat_id.split("_").length > 1) {
                const chatDialogMessageList = state.chatDialogMessageList[chat_id.split("_")[0]];
                if (chatDialogMessageList) {
                    const chat_message = state.chatDialogMessageList[chat_id.split("_")[0]].find((el) => el.message_id == chat_id.split("_")[1]);
                    if (chat_message) {
                        delete chat_message.extraVariant;
                    }
                }
            }
        },
        setIsLoading : (state, action) => {
            const { chat_id, isLoading } = action.payload;
            if (!state.chatDialogStates[chat_id]) {
                state.chatDialogStates[chat_id] = {};
            }
            state.chatDialogStates[chat_id].isLoading = isLoading;
        },
        setIsAllMessagesLoaded : (state, action) => {
            const { chat_id } = action.payload;
            if (!state.chatDialogStates[chat_id]) {
                state.chatDialogStates[chat_id] = {};
            }
            state.chatDialogStates[chat_id].isAllMessagesLoaded = true;
        },
        setChatTyping : (state, action) => {
            const { chat_id } = action.payload;
            if (!state.chatDialogStates[chat_id]) {
                state.chatDialogStates[chat_id] = {};
            }
            state.chatDialogStates[chat_id].chatTyping = action.payload.chat_typing;
        },
        setChatDialogReadAll : (state, action) => {
            const { chat_id } = action.payload;
            for(const chatDialog of state.chatDialogList) {
                if (chatDialog.chat_id == chat_id) {
                    chatDialog.last_message_count = 0;
                    break;
                }
            }
        },
        clearChatDialogAll : (state, action) => {
            // state.chatDialogList = [];
            state.chatDialogMessageList = {};
            state.chatDialogStates = {};
        },
        setOnLineClients : (state, action) => {
            state.onLineClients = action.payload.online_clients;
        }
        // addTask: (state, action) => {
        //     state.task = (action.payload);
        //     // найдем таску в стейте и обновим ее новыми данными
        //     state.taskList = state.taskList.map((task) => {
        //         if (task.task_id === state.task.task_id) {
        //             return state.task;
        //         }
        //         return task;
        //     });
        // },
        // dndTask: (state, action) => {
        //     let indexFrom=0;
        //     for(const task of state.taskList) {
        //         if (task.task_id === action.payload.from) {
        //             break;
        //         }
        //         indexFrom++;
        //     }
        //     let indexTo=0;
        //     for(const task of state.taskList) {
        //         if (task.task_id === action.payload.to) {
        //             break;
        //         }
        //         indexTo++;
        //     }
        //     // создаем клон объекта таски
        //     const task = JSON.parse(JSON.stringify(state.taskList[indexFrom]));
        //     // удаляем элемент из массива
        //     state.taskList.splice(indexFrom,1);
        //     // создаем клон объект
        //     state.taskList.splice(indexTo,0,task);
        // },
        // addTaskList: (state, action) => {
        //     state.taskList = (action.payload);
        // },
        // appendTaskList: (state, action) => {
        //     state.taskList.push([...action.payload]);
        // },
        // addPtt : (state, action) => {
        //     state.ptt = (action.payload);
        // },
        // addProjectSubject : (state, action) => {
        //     state.project_subject = (action.payload);
        // },
        // addProjectSubjectItemList : (state, action) => {
        //     state.project_subject_item_list = (action.payload);
        // },
        // addProjectSubjectItem : (state, action) => {
        //     state.project_subject_item = (action.payload);
        // }
    }
});

export const { 
    addChatDialog,
    appendChatDialog,
    addChatDialogList,
    addChatChatDialogMesageList,
    appendChatDialogMessage,
    setIsLoading,
    setIsAllMessagesLoaded,
    setChatDialogReadAll,
    clearChatDialogAll,
    clearExtraVariant,
    setOnLineClients,
    setChatTyping
} = chatSlice.actions;

export default chatSlice.reducer;