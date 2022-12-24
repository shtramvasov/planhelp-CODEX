import { createBrowserRouter, RouterProvider, useNavigate, useLocation} from "react-router-dom";
import { Login}  from "./login/Login";
import { Logout}  from "./login/Logout";
import Main from "./main/Main";
import Disk from "./disk/Disk";
import DiskFile from "./disk/DiskFile";
import DiskPath from "./disk/DiskPath";
import Task from "./task/Task";
import Hr from "./hr/Hr";

import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import Cookies from 'js-cookie';
import queryString from 'query-string';

const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
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
