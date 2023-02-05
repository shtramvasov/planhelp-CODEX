import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import { login, logout } from '../../reducers/User'
import { useNavigate, Link } from "react-router-dom";
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import { getUserProfile, postUserProfile } from '../../network/UserNetwork';
import { addProfile } from '../../reducers/User';

export function Navbar(props) {

    const fetchUserProfile = () => {
        getUserProfile({},(err,resp) => {
            if (!err) {
                dispatch(addProfile(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const dispatch = useDispatch()

    useEffect(() => {
        fetchUserProfile();
    },[]);
    
    // dispatch(logout());
    // window.location.href = "/login";
    // return <div>Logout now...</div>;
    
    const User = useSelector((state) => state.user);
    return  (  
    <Nav className="justify-content-left" activeKey="/">
        {/* <Nav.Item>
            <Nav.Link as={Link} to="/">Главная</Nav.Link>
        </Nav.Item> */}
        <Nav.Item>
            <Nav.Link as={Link} to="/disk">Диск</Nav.Link>
        </Nav.Item>
        {/* <Nav.Item>
            <Nav.Link as={Link} to="/task">Задачи</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/hr">Люди</Nav.Link>
        </Nav.Item> */}
        <Nav.Item>
            <Nav.Link as={Link} to="/notify">Уведомления&nbsp;
            {User.profile.notify_count?<Badge bg="primary">{User.profile.notify_count}</Badge> :""}
            </Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
        </Nav.Item>
        {/* <Nav.Item>
            <Nav.Link as={Link} to="/logout">Выйти</Nav.Link>
        </Nav.Item> */}
    </Nav>
    )
}