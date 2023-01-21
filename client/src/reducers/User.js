import { createSlice } from '@reduxjs/toolkit'
import Cookies from 'js-cookie';

export const userSlice = createSlice({
    name: 'User',
    initialState: {
        isLogin : false,
        profile : {
            login : "",
            secret : ""
        }
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
    },
});

export const { login, logout, addProfile } = userSlice.actions;

export default userSlice.reducer;