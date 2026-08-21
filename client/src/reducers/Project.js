import { createSlice } from '@reduxjs/toolkit'

export const projectSlice = createSlice({
    name: 'Project',
    initialState: {
        projectList : [],
        project : {
            project_id: null,
            project_name: "",
            project_note: "",
            created_on: "",
            created_by: null,
            is_deleted: "",
            total_task_count: null,
            total_user_count: null,
            user_role: "",
            created_by_model: {
                    login: "",
                    user_id: null
            },
            project_user_list: [
                // {
                //     user_id: null,
                //     login: "",
                //     user_role: ""
                // }
            ],
            project_status_list: [
                // {
                //     "status_id": 1,
                //     "project_id": 16,
                //     "status_name": "first status",
                //     "status_color": "RED",
                //     "is_deleted": "N"
                // }
            ],
            project_tag_list : [
                // {
                //     "tag_id": 22,
                //     "project_id": 23,
                //     "tag": "xxxx"
                // }
            ],
            project_subject_list : [
                // {
                //     "subject_id": 13,
                //     "project_id": 23,
                //     "subject_name": "Сторис",
                //     "is_deleted": "N",
                //     "orderby_time": 1739376498,
                //     "subject_type" : ""
                // }
            ]
        },
        task : {
            task_id : null,
            project_id : null,
            task_title : "",
            task_note : "",
            created_on : "",
            closed_on : "",
            created_by : null,
            is_deleted : "",
            status_id : null,
            executor_id : null,
            responsible_id : null,
            reviewer_id : null,
            ru_created_login : "",
            ru_executor_login : "",
            ru_executor_id : null,
            ru_responsible_login : null,
            ru_responsible_id : null,
            ru_reviewer_login : null,
            ru_reviewer_id : null,
            comments : [],
            files : [],
            tags : [],
            timetable : [],
            psi_list : []
        },
        taskList : [],
        ptt : {
            ptt_id : null,
            task_id : 103,
            user_id : null,
            date_start : null,
            date_end : null,
            login : ""
        },
        project_subject : {
            subject_id : null,
            project_id : null,
            subject_name : "",
            is_deleted : "",
            orderby_time : null,
            display_variant : null
        },
        project_subject_item_list : [
            // {
            //     "psi_id": 2,
            //     "subject_id": 24,
            //     "psi_name": "psi_name #2",
            //     "date_start": null,
            //     "date_end": null,
            //     "status": 1,
            //     "orderby_time": 1739288192
            // }
        ],
        project_subject_item : {
            psi_id: null,
            subject_id: null,
            psi_name: "",
            date_start: null,
            date_end: null,
            status: null,
            orderby_time: null,
            psi_note : ""
        }
    },
    reducers: {
        addProject: (state, action) => {
            state.project = (action.payload);
        },
        addProjectList: (state, action) => {
            state.projectList = (action.payload);
        },
        addTask: (state, action) => {
            state.task = (action.payload);
            // найдем таску в стейте и обновим ее новыми данными
            state.taskList = state.taskList.map((task) => {
                if (task.task_id === state.task.task_id) {
                    return state.task;
                }
                return task;
            });
        },
        dndTask: (state, action) => {
            let indexFrom=0;
            for(const task of state.taskList) {
                if (task.task_id === action.payload.from) {
                    break;
                }
                indexFrom++;
            }
            let indexTo=0;
            for(const task of state.taskList) {
                if (task.task_id === action.payload.to) {
                    break;
                }
                indexTo++;
            }
            // создаем клон объекта таски
            const task = JSON.parse(JSON.stringify(state.taskList[indexFrom]));
            // удаляем элемент из массива
            state.taskList.splice(indexFrom,1);
            // создаем клон объект
            state.taskList.splice(indexTo,0,task);
        },
        addTaskList: (state, action) => {
            state.taskList = (action.payload);
        },
        appendTaskList: (state, action) => {
            state.taskList.push([...action.payload]);
        },
        addPtt : (state, action) => {
            state.ptt = (action.payload);
        },
        addProjectSubject : (state, action) => {
            state.project_subject = (action.payload);
        },
        addProjectSubjectItemList : (state, action) => {
            state.project_subject_item_list = (action.payload);
        },
        addProjectSubjectItem : (state, action) => {
            state.project_subject_item = (action.payload);
        }
    }
});

export const { 
    addProject,
    addProjectList,
    addTask,
    dndTask,
    addTaskList,
    appendTaskList,
    addPtt,
    addProjectSubject,
    addProjectSubjectItemList,
    addProjectSubjectItem
} = projectSlice.actions;

export default projectSlice.reducer;