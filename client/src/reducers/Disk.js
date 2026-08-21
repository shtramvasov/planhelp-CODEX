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
            childEntityList : [],
            remindNoteList : [],
            child_de_count : null,
            breadcrumb : []
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
            note_2 : "'",
            note_type : "",
            note : "",
            variant : "",
            login : ""
        },
        selectedEntityIdList : []
    },
    reducers: {
        addEntity: (state, action) => {
            if (!action.payload.breadcrumb) {
                action.payload.breadcrumb = [];
            }
            action.payload.breadcrumb.unshift({entity_name:"Документы",entity_id:""});
            state.entity = (action.payload);
        },
        modifyEntity: (state, action) => {
            if (action.payload.entity_name) {
                state.entity = {...state.entity, entity_name : action.payload.entity_name}
            }
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
        addLastUploadFile: (state, action) => {
            state.lastUploadFile = (action.payload)
        },
        addEntityNotes: (state, action) => {
            state.entityNotes = (action.payload);
        },
        addEntityNote: (state, action) => {
            state.entityNote = (action.payload);
        },
        selectEntity: (state,action) => {
            // находим позицию элемента в массиве
            const index = state.selectedEntityIdList.indexOf(action.payload);
            console.log(index)
            if (index < 0) {
                // добавляем в коллекцию
                console.log("ADD", action.payload);
                state.selectedEntityIdList.push(action.payload);
            } else {
                console.log("RM ",action.payload);
                state.selectedEntityIdList.splice(index,1);
            }
        },
        clearSelectedEntityList: (state,action) => {
            // Очистить список всех выбранных entity
            state.selectedEntityIdList = []
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
    addLastUploadFile,
    selectEntity,
    modifyEntity,
    clearSelectedEntityList} = diskSlice.actions;

export default diskSlice.reducer;