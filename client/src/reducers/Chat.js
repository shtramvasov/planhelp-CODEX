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
            chat_user_list : []
        },
        // messageList : [],
        // message : {
        //     ""
        // }
    },
    reducers: {
        addChatDialog: (state, action) => {
            state.chatDialog = (action.payload);
        },
        addChatDialogList: (state, action) => {
            state.chatDialogList = (action.payload);
        },
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
    addChatDialogList
} = chatSlice.actions;

export default chatSlice.reducer;