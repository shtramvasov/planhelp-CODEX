import { createBrowserRouter, RouterProvider, useNavigate, useLocation} from "react-router-dom";
import Cookies from 'js-cookie';

import { Login}  from "./login/Login";
import { Logout}  from "./login/Logout";

import Profile from "./profile/Profile";
import Disk from "./disk/Disk";
import DiskFile from "./disk/DiskFile";
import DiskPath from "./disk/DiskPath";
import DiskActivity from "./disk/DiskActivity";
import DiskActivityOld from "./disk/DiskActivityOld";
import NotifyList from "./notify/NotifyList";

import ProjectCreate from "./project/settings/ProjectCreate";
import ProjectAccess from './project/settings/ProjectAccess';
import ProjectUpdate from './project/settings/ProjectUpdate';
import ProjectStatus from './project/settings/ProjectStatus';
import ProjectTags from './project/settings/ProjectTags';
import ProjectList from "./project/ProjectList";

import TaskList from "./project/task/TaskList";
import TaskDetail from "./project/task/TaskDetail";

import Sprint from "./project/sprint";
import Story from "./project/story";

import Hr from "./hr/Hr";

const router = createBrowserRouter([
    { path: "/", element: <Disk /> },
    { path: "/disk", element: <Disk /> },
    { path: "/disk/:entity_id", element: <Disk /> },
    { path: "/disk/:entity_id/file/:mode", element: <DiskFile /> },
    { path: "/disk/:entity_id/path/:mode", element: <DiskPath /> },
    { path: "/disk/:entity_id/activity", element: <DiskActivity /> },
    { path: "/disk/:entity_id/activity/:activity_id", element: <DiskActivityOld /> },
    // Проекты и задачи
    { path: "/project", element: <ProjectList /> },
    { path: "/project/add", element: <ProjectCreate /> },
    { path: "/project/:project_id/settings", element: <ProjectUpdate /> },
    { path: "/project/:project_id/settings/access", element: <ProjectAccess /> },
    { path: "/project/:project_id/settings/status", element: <ProjectStatus /> },
    { path: "/project/:project_id/settings/tags", element: <ProjectTags /> },
    
    { path: "/project/:project_id/sprint", element: <Sprint /> },
    { path: "/project/:project_id/story", element: <Story /> },
    { path: "/project/:project_id", element: <TaskList /> },
    { path: "/project/:project_id/:mode", element: <TaskList /> },
    { path: "/project/:project_id/task/:task_id", element: <TaskDetail /> },

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

    return (
        <RouterProvider router={router} />
    );
}

export default Router;
