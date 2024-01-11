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

            ]
        },
        task : {
            task_id : null,
            project_id : null,
            task_title : "",
            task_note : "",
            created_on : "",
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
            tags : []
        },
        taskList : []
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
        addTaskList: (state, action) => {
            state.taskList = (action.payload);
        }
    }
});

export const { 
    addProject,
    addProjectList,
    addTask,
    addTaskList
} = projectSlice.actions;

export default projectSlice.reducer;