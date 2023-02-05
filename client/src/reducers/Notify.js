import { createSlice } from '@reduxjs/toolkit'

export const notifySlice = createSlice({
    name: 'Notify',
    initialState: {
        notifyList : []
    },
    reducers: {
        addNotifyList: (state, action) => {
            state.notifyList = action.payload;
        }
    },
});

export const { addNotifyList } = notifySlice.actions;

export default notifySlice.reducer;