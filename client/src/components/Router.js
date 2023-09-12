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
import Task from "./task/Task";
import TaskProjectForm from "./task/TaskProjectForm";
import TaskProjectList from "./task/TaskProjectList";
import TaskProjectTaskForm from "./task/TaskProjectTaskForm";
import Hr from "./hr/Hr";

import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import Cookies from 'js-cookie';
import queryString from 'query-string';
import TaskProjectActivity from "./task/TaskProjectActivity";
import TaskProjectUpdate from "./task/TaskProjectUpdate";

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
   
    {
        path: "/task/project/add",
        element: <TaskProjectForm />,
    },
    {
        path: "/task/project/:project_id/edit",
        element: <TaskProjectUpdate />,
    },
    {
        path: "/task/project/:project_id/",
        element: <TaskProjectList />,
    },
    {
        path: "/task/project/:project_id/activity",
        element: <TaskProjectActivity />,
    },
    {
        path: "/task/project/:project_id/:task_id",
        element: <TaskProjectTaskForm />,
    },
    {
        path: "/task",
        element: <Task />,
    },
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
