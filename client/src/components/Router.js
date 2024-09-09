import { createBrowserRouter, RouterProvider, useNavigate, useLocation} from "react-router-dom";
import Cookies from 'js-cookie';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { clearSnackBar } from '../reducers/App';
import { useSelector, useDispatch } from 'react-redux';
import { Login}  from "./login/Login";
import { Logout}  from "./login/Logout";

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
import ProjectList from "./project/ProjectList";

import TaskList from "./project/task/TaskList";
import TaskDetail from "./project/task/TaskDetail";

import SprintList from "./project/sprint/SprintList";
import SprintCreate from "./project/sprint/SprintCreate";
import SprintUpdate from "./project/sprint/SprintUpdate";
import SprintTaskList from "./project/sprint/SprintTaskList";

import Story from "./project/story";

import Hr from "./hr/Hr";

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
    
    // Задачи
    { path: "/project/:project_id", element: <TaskList /> },
    { path: "/project/:project_id/:mode", element: <TaskList /> },
    { path: "/project/:project_id/task/:task_id", element: <TaskDetail /> },

    // Спринты
    { path: "/project/:project_id/sprint/", element: <SprintList /> },
    { path: "/project/:project_id/sprint/add", element: <SprintCreate /> }, 
    { path: "/project/:project_id/sprint/:sprint_id/edit", element: <SprintUpdate /> },
    { path: "/project/:project_id/sprint/:sprint_id/task", element: <SprintTaskList /> },

    { path: "/project/:project_id/story", element: <Story /> },

    { path: "/hr", element: <Hr /> },
    { path: "/notify", element: <NotifyList /> },
    { path: "/profile", element: <Profile /> },
    
    { path: "/login", element: <Login /> },
    { path: "/logout", element: <Logout /> }
]);

function Router() {
    // const User = useSelector((state) => state.user);
    
    if (!Cookies.get("secret") && window.location.pathname != "/login") {
        window.location.href = "/login";
    }
    const App = useSelector((state) => state.app);
    
    const dispatch = useDispatch()
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
