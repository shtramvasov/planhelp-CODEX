import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
    name: 'App',
    initialState: {
        snackbar : {
            positiveMessage  : "",
            negativeMessage : ""
        }
    },
    reducers: {
        addPositiveMessage: (state, action) => {
            state.snackbar = {
                positiveMessage : action.payload,
                negativeMessage : ""
            };
        },
        addNegativeMessage: (state, action) => {
            state.snackbar = {
                positiveMessage : "",
                negativeMessage : action.payload
            };
        },
        clearSnackBar: (state, action) => {
            state.snackbar = {
                positiveMessage : "",
                negativeMessage : ""
            };
        },
    },
});

export const { addPositiveMessage, addNegativeMessage, clearSnackBar } = userSlice.actions;

export default userSlice.reducer;