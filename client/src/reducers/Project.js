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
            ]
        }
    },
    reducers: {
        addProject: (state, action) => {
            state.project = (action.payload);
        },
        addProjectList: (state, action) => {
            state.projectList = (action.payload);
        },
    }
});

export const { 
    addProject,
    addProjectList
} = projectSlice.actions;

export default projectSlice.reducer;