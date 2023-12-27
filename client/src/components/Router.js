import { createBrowserRouter, RouterProvider, useNavigate, useLocation} from "react-router-dom";
import { Login}  from "./login/Login";
import { Logout}  from "./login/Logout";
import Main from "./main/Main";
import Profile from "./profile/Profile";
import Disk from "./disk/Disk";
import DiskFile from "./disk/DiskFile";
import DiskPath from "./disk/DiskPath";
import DiskActivity from "./disk/DiskActivity";
import DiskActivityOld from "./disk/DiskActivityOld";
import NotifyList from "./notify/NotifyList";

import ProjectList from "./project/ProjectList";
import ProjectForm from "./project/ProjectForm";
import ProjectFormUpdate from "./project/ProjectFormUpdate";

import TaskList from "./project/TaskList";
import TaskDetail from "./project/TaskDetail";

import Hr from "./hr/Hr";

import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import Cookies from 'js-cookie';
import queryString from 'query-string';

import ProjectSettings from './project/settings/ProjectSettings';


const router = createBrowserRouter([
    {
      path: "/",
      element: <Disk />, // todo Main
    },
    {
        path: "/disk",
        element: <Disk />,
    },
    {
        path: "/disk/:entity_id",
        element: <Disk />,
    },
    {
        path: "/disk/:entity_id/file/:mode",
        element: <DiskFile />,
    },
    {
        path: "/disk/:entity_id/path/:mode",
        element: <DiskPath />,
    },
    {
        path: "/disk/:entity_id/activity",
        element: <DiskActivity />,
    },
    {
        path: "/disk/:entity_id/activity/:activity_id",
        element: <DiskActivityOld />,
    },
    // Проекты и задачи
    {
        path: "/project",
        element: <ProjectList />,
    },
    {
        path: "/project/add",
        element: <ProjectForm />,
    },
    {
        path: "/project/:project_id/settings/*",
        element: <ProjectSettings />,
    },
    {
        path: "/project/:project_id/:mode",
        element: <TaskList />,
    },
    {
        path: "/project/:project_id/task/:task_id",
        element: <TaskDetail />,
    },
    // /project/:project_id/sprint
    // /project/:project_id/sprint/:sprint_id

    // /project/:project_id/milestone
    // /project/:project_id/milestone/:milestone_id

    // 
    {
        path: "/hr",
        element: <Hr />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/notify",
        element: <NotifyList />,
    },
    {
        path: "/profile",
        element: <Profile />,
    },
    {
        path: "/logout",
        element: <Logout />,
    }
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
