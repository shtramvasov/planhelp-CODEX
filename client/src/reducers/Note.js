import { createSlice } from '@reduxjs/toolkit'

export const noteSlice = createSlice({
    name: 'Note',
    initialState: {
        noteList : {},
        note : {}
    },
    reducers: {
        addNoteList: (state, action) => {
            state.noteList = action.payload;
        },
        addNote: (state, action) => {
            state.note = action.payload;
        }
    },
});

export const { addNoteList, addNote } = noteSlice.actions;

export default noteSlice.reducer;