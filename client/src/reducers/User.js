import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie';

export const userSlice = createSlice({
    name: 'User',
    initialState: {
        isLogin : false,
        isOnline : false,
        isChatAuth : false,
        profile : {
            login : "",
            secret : "",
            email : "",
            telegram_chat_id : "",
            is_notify : 0,
            timezone : "",
            username : "",
            avatar_url : ""
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
        },
        online: (state) => {
            state.isOnline = true;  
        },
        offline: (state) => {
            state.isOnline = false;
        },
        chatAuth: (state) => {
            state.isChatAuth = true;
        },
        chatNotAuth: (state) => {
            state.isChatAuth = false;
        }

    },
});

export const { login, logout, addProfile, addUserList, online, offline, chatAuth, chatNotAuth} = userSlice.actions;

export default userSlice.reducer;