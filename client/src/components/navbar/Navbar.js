import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import { login, logout } from '../../reducers/User'
import { useNavigate, Link } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';

export function Navbar(props) {

    // const dispatch = useDispatch()
    // dispatch(logout());
    // window.location.href = "/login";
    // return <div>Logout now...</div>;
    return  (  
    <Nav className="justify-content-left" activeKey="/">
        <Nav.Item>
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/disk">Диск</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/task">Задачи</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/hr">Люди</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/logout">Выйти</Nav.Link>
        </Nav.Item>
    </Nav>
    )
}