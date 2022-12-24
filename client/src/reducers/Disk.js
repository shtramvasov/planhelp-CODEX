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
            childEntityList : []
        }
    },
    reducers: {
        addEntity: (state, action) => {
            state.entity = (action.payload);
        }
    },
});

export const { addEntity } = diskSlice.actions;

export default diskSlice.reducer;