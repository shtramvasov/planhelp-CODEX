import { createSlice } from '@reduxjs/toolkit'

export const diskSlice = createSlice({
    name: 'Disk',
    initialState: {
        entity : {
            entity_id: null,
            entity_name: "",
            entity_type: "",
            parent_entity_id: null,
            created_by: null,
            created_on: "",
            login : "",
            childEntityList : []
        },
        entityActivity : [],
        entityActivityOld : {
            activity_id : null,
            entity_id : null,
            entity_note_old : "",
            created_by : null,
            created_on : null
        },
        entityUsers : [],

        // Список файлов
        entityFiles : [],
        // Последний добавленный файл
        lastUploadFile: {},
        entityNotes : [],
        entityNote : {
            note_id : null,
            user_id : null,
            entity_id : null,
            created_on : null,
            remind_on : null,
            is_remind : 0,
            is_deleted : 0,
            note : "",
            variant : "",
            login : ""
        }
    },
    reducers: {
        addEntity: (state, action) => {
            state.entity = (action.payload);
        },
        addEntityActivity: (state, action) => {
            state.entityActivity = (action.payload);
        },
        addEntityActivityOld: (state, action) => {
            state.entityActivityOld = (action.payload);
        },
        addEntityUsers: (state, action) => {
            state.entityUsers = (action.payload);
        },
        // addEntityFiles: (state, action) => {
        //     state.entityFiles = (action.payload)  
        // },
        addLastUploadFile: (state, action) => {
            state.lastUploadFile = (action.payload)
        },
        addEntityNotes: (state, action) => {
            state.entityNotes = (action.payload);
        },
        addEntityNote: (state, action) => {
            state.entityNote = (action.payload);
        }
    }
});

export const { 
    addEntity, 
    addEntityActivity, 
    addEntityActivityOld, 
    addEntityUsers, 
    addEntityNotes,
    addEntityNote,
    // addEntityFiles,
    addLastUploadFile } = diskSlice.actions;

export default diskSlice.reducer;