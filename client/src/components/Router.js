import { createBrowserRouter, RouterProvider, useNavigate, useLocation, useParams} from "react-router-dom";
import { wsSocket } from '../network/WebSocket';
import Cookies from 'js-cookie';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { clearSnackBar } from '../reducers/App';
import { online, offline, chatAuth, chatNotAuth } from '../reducers/User';
import { 
    addChatDialogList, 
    addChatDialog, 
    addChatChatDialogMesageList, 
    appendChatDialogMessage,
    setIsLoading,
    setIsAllMessagesLoaded,
    setChatDialogReadAll,
    clearChatDialogAll,
    setOnLineClients,
    setChatTyping } from "../reducers/Chat";
import { addPositiveMessage, addNegativeMessage } from '../reducers/App';
import { useSelector, useDispatch } from 'react-redux';
import { Login}  from "./login/Login";
import { Logout}  from "./login/Logout";
import { useEffect, useState } from "react";

import Profile from "./profile/Profile";
import Disk from "./disk/Disk";
import DiskFile from "./disk/DiskFile";
import DiskPath from "./disk/DiskPath";
import DiskSpreadsheet from './disk/DiskSpreadsheet';
import DiskActivity from "./disk/DiskActivity";
import DiskActivityOld from "./disk/DiskActivityOld";
import NotifyList from "./notify/NotifyList";

import ProjectCreate from "./project/settings/ProjectCreate";
import ProjectUpdate from './project/settings/ProjectUpdate';
import ProjectAccess from './project/settings/ProjectAccess';
import ProjectStatus from './project/settings/ProjectStatus';
import ProjectTags from './project/settings/ProjectTags';
import ProjectSubjectList from './project/settings/ProjectSubject/ProjectSubjectList';
import ProjectList from "./project/ProjectList";

import TaskList from "./project/task/TaskList";
import TaskDetail from "./project/task/TaskDetail";

import Calendar from "./calendar/Calendar";

import SubjectItemList from "./project/subject/SubjectItemList";

import Hr from "./hr/Hr";

import Chat from "./chat/Chat";
import BetterChat from "./better_chat/BetterChat";

const router = createBrowserRouter([
    { path: "/", element: <Disk /> },
    { path: "/disk", element: <Disk /> },
    { path: "/disk/:entity_id", element: <Disk /> },
    { path: "/disk/:entity_id/file/:mode", element: <DiskFile /> },
    { path: "/disk/:entity_id/path/:mode", element: <DiskPath /> },
    { path: "/disk/:entity_id/spreadsheet", element: <DiskSpreadsheet /> },
    { path: "/disk/:entity_id/activity", element: <DiskActivity /> },
    { path: "/disk/:entity_id/activity/:activity_id", element: <DiskActivityOld /> },
    
    // Проекты и настройки
    { path: "/project", element: <ProjectList /> },
    { path: "/project/add", element: <ProjectCreate /> },
    { path: "/project/:project_id/settings", element: <ProjectUpdate /> },
    { path: "/project/:project_id/settings/access", element: <ProjectAccess /> },
    { path: "/project/:project_id/settings/status", element: <ProjectStatus /> },
    { path: "/project/:project_id/settings/tags", element: <ProjectTags /> },
    { path: "/project/:project_id/settings/subject", element: <ProjectSubjectList /> },
    
    // Тематики
    { path: "/project/:project_id/subject/:subject_id", element: <SubjectItemList /> },

    // Задачи
    { path: "/project/:project_id", element: <TaskList /> },
    { path: "/project/:project_id/:mode", element: <TaskList /> },
    { path: "/project/:project_id/task/:task_id", element: <TaskDetail /> },

    { path: "/calendar", element: <Calendar /> },

    { path: "/hr", element: <Hr /> },
    { path: "/notify", element: <NotifyList /> },
    { path: "/profile", element: <Profile /> },
    
    { path: "/login", element: <Login /> },
    { path: "/logout", element: <Logout /> },

    // Чаты
    { path: "/chat", element: <Chat /> },
    { path: "/chat/:chat_id", element: <Chat /> },
    { path: "/chat/:chat_id/message/:message_id", element: <Chat /> },

    // MUI Чат
    { path: "/better_chat", element: <BetterChat /> },
    { path: "/better_chat/:chat_id", element: <BetterChat /> },
]);

function Router() {
    const dispatch = useDispatch();

    const App = useSelector((state) => state.app);
    const User = useSelector((state) => state.user);
    const Chat = useSelector((state) => state.chat);

    const [readyState, setReadyState] = useState(wsSocket.socket?.readyState);
    wsSocket.onSetReadyState = setReadyState;

    if (!Cookies.get("secret") && window.location.pathname != "/login") {
        window.location.href = "/login";
    }

    // по сути инициализация сокета + добавление слушателя событий
    useEffect(() => {
        wsSocket.addListener( (event) => {
            const wsMessage = JSON.parse(event.data);
            
            if (wsMessage.error) {
                dispatch(addNegativeMessage(wsMessage.error.message));
            }

            if (wsMessage.auth) {
                dispatch(chatAuth());
            }
            if (wsMessage.chat_message_list) {
                dispatch(addChatChatDialogMesageList(wsMessage));

                dispatch(setIsLoading({
                    chat_id : wsMessage.chat_id,
                    isLoading : false
                }));

                if (wsMessage.chat_message_list.length == 0) {
                    dispatch(setIsAllMessagesLoaded({
                        chat_id : wsMessage.chat_id
                    }));
                }
            }
            // новое сообщение в чат
            if (wsMessage.chat_message) {
                dispatch(appendChatDialogMessage(wsMessage));
            }
            // список чатов
            if (wsMessage.chat_list) {
                dispatch(addChatDialogList(wsMessage.chat_list));
            }

            if (wsMessage.chat_read_all) {
                dispatch(setChatDialogReadAll(wsMessage));
            }

            // список онлайн юзеров
            if (wsMessage.online_clients) {
                dispatch(setOnLineClients(wsMessage));
            }

            if (wsMessage.chat_typing) {
                dispatch(setChatTyping(wsMessage));
                setTimeout(() => {
                    dispatch(setChatTyping({chat_id : wsMessage.chat_id, chat_typing : {}}));
                    // console.log("clear typing")
                }, 4000);
            }
        });
    },[]);

    // для онлайн / оффлайн
    useEffect(() => {
        if (readyState == 1) {
            dispatch(online());
        } else {    
            dispatch(offline());
            dispatch(chatNotAuth());
        }
    },[readyState]);

    useEffect(() => {
        console.log("AUTH!!")
        if (readyState) {
            wsSocket.socket.send(JSON.stringify({
                action : "auth",
                // action_id : crypto.randomUUID(),
                payload : {
                    token : Cookies.get("secret")
                }
            }));
        }
    },[User.isLogin, readyState])

    useEffect(() => {
        if (!User.isChatAuth) {
            // clear old chats
            dispatch(clearChatDialogAll());
            //actionGetChatDialogList();
	        console.log("clear old chats");
        }
        if (User.isOnline && User.isChatAuth) {
            actionGetChatDialogList();
        }
    },[User.isOnline, User.isChatAuth]);

    // запрос в сокет списка моих чатов
    const actionGetChatDialogList = () => {
        wsSocket.socket.send(JSON.stringify({
            action : "chat_list",
            // action_id : crypto.randomUUID(),
            payload : {}
        }));
    }

    return (<>
        <RouterProvider router={router} />
        {/* Снек бар либо о позитивных сообщениях либо о негативных 
            юзается так 
            1) dispatch(addPositiveMessage(messages.SUCCESS_SAVE));
            2) dispatch(addNegativeMessage(messages.SUCCESS_SAVE));
        */}
        <Snackbar
            open={!!App.snackbar.positiveMessage || !!App.snackbar.negativeMessage}
            autoHideDuration={3000}
            onClose={(event, reason) => {
                dispatch(clearSnackBar())
            }}>
            {App.snackbar.positiveMessage ? 
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {App.snackbar.positiveMessage}
                </Alert> : 
            App.snackbar.negativeMessage ? 
                <Alert
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {App.snackbar.negativeMessage}
                </Alert> : 
            <Alert/>
            }
        </Snackbar>
        </>
    );
}

export default Router;
