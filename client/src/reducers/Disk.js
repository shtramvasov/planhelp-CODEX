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
        }
    },
});

export const { addEntity, addEntityActivity, addEntityActivityOld } = diskSlice.actions;

export default diskSlice.reducer;