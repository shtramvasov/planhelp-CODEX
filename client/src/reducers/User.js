import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie';

export const userSlice = createSlice({
    name: 'User',
    initialState: {
        isLogin : false
    },
    reducers: {
        login: (state, action) => {
            console.log(action.payload.secret)
            Cookies.set("secret",action.payload);
            state.isLogin = true ;
        },
        logout: (state) => {
            Cookies.remove("secret");
            state.isLogin = false ;
        },
    },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;