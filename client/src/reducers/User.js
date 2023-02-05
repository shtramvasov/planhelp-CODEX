import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie';

export const userSlice = createSlice({
    name: 'User',
    initialState: {
        isLogin : false,
        profile : {
            login : "",
            secret : "",
            email : "",
            telegram_chat_id : "",
            is_notify : 0
        },
        userList : []
    },
    reducers: {
        login: (state, action) => {
            Cookies.set("secret",action.payload, { expires: 365 });
            state.isLogin = true ;
        },
        logout: (state) => {
            Cookies.remove("secret");
            state.isLogin = false ;
        },
        addProfile: (state, action) => {
            state.profile = action.payload;
        },
        addUserList: (state, action) => {
            state.userList = action.payload;
        }
    },
});

export const { login, logout, addProfile, addUserList } = userSlice.actions;

export default userSlice.reducer;