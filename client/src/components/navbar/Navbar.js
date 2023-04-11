import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import { login, logout } from '../../reducers/User'
import { useNavigate, Link } from "react-router-dom";
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import { getUserProfile, postUserProfile } from '../../network/UserNetwork';
import { addProfile } from '../../reducers/User';

import { Button, Container, Dropdown, DropdownButton } from 'react-bootstrap';
import { Navbar as NavBar } from 'react-bootstrap';
import ProfileIcon from '../../resources/img/profile.svg'

export function Navbar(props) {

    const User = useSelector((state) => state.user);

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
    
    // Показываем бейдж с кол-во непрочитаных пушей
    const BadgeCountNotification = () => {
        return (
        <>
        { User.profile.notify_count ? 
            <span class="position-absolute top-45 start-100 translate-middle badge rounded-pill bg-danger" style={{ marginTop: '5px' }} > 
                { User.profile.notify_count }
            </span>
        : 
        "" 
        }
        </>
        )
    }
    
    return  (  
        <>
        <NavBar>
            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link as={Link} to="/disk">Диск</Nav.Link>
                </Nav.Item>
            </Nav>

            <NavBar.Collapse className="justify-content-end">
                <Nav.Item>
                <Dropdown>
                    <Dropdown.Toggle variant="link" bsPrefix="p-0">
                        <img className='rounded-circle' src={ProfileIcon} width="40" height="40"/>
                        { BadgeCountNotification() }
                    </Dropdown.Toggle>
                    <Dropdown.Menu align='end'>
                        <Dropdown.Item>
                            <Nav.Link as={Link} to="/profile" > Профиль </Nav.Link>
                        </Dropdown.Item>
                        <Dropdown.Item> 
                            <Nav.Link as={Link} to="/notify" > Уведомления </Nav.Link>
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item href='/logout'> Выйди из системы </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Nav.Item>
            </NavBar.Collapse>
        </NavBar>
        </>
    )
}