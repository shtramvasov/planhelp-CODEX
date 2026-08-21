import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from "react";
import { login, logout } from '../../reducers/User'
import { useNavigate, Link, useLocation } from "react-router-dom";
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import { getUserProfile, postUserProfile } from '../../network/UserNetwork';
import { addProfile } from '../../reducers/User';

import { Button, Container, Dropdown, DropdownButton, Spinner } from 'react-bootstrap';
import { Navbar as NavBar } from 'react-bootstrap';
import ProfileIcon from '../../resources/img/profile.svg'
import useWindowActive from '../useWindowActive';


export function Navbar(props) {
    const location = useLocation();
    const User = useSelector((state) => state.user);
    const Chat = useSelector((state) => state.chat);
    const audioUrl = 'https://planhelp.ru/api/download/3/2026_2_19_1177300_oh-oh-icq-sound.mp3';
    const playAudio = () => {
	    const audio = new Audio(audioUrl);
        audio.volume = 0.1;
        audio.play();
    };
    const isWindowActive = useWindowActive();
    const [countUnreadMessages, setCountUnreadMessages] = useState(0);

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
    
    // запрос в сокет списка чатов
    useEffect(() => {
        let countUnreadMessages = 0;
        for (const chatDialog of Chat.chatDialogList) {
            if (chatDialog.notify_status == 1) {
                countUnreadMessages += chatDialog.last_message_count;
            }
        }
        if (countUnreadMessages) {
            setCountUnreadMessages(countUnreadMessages);
        } else {
            setCountUnreadMessages(0);
        }
        if (countUnreadMessages) {
	    if (!isWindowActive) {
		    playAudio();
	    }
            document.title = `${countUnreadMessages} сообщений в чатах | planhelp`;
        } else {
            if (location.pathname.includes("/disk")) {
                document.title = `Документы | planhelp`;
            } else
            if (location.pathname.includes("/project")) {
                document.title = `Проекты | planhelp`;
            } else
            if (location.pathname.includes("/calendar")) {
                document.title = `Календарь | planhelp`;
            } else
            if (location.pathname.includes("/chat")) {
                document.title = `Чат | planhelp`;
            } else
            if (location.pathname.includes("/better_chat")) {
                document.title = `Чат | planhelp`;
            } else
            if (location.pathname.includes("/profile")) {
                document.title = `Профиль | planhelp`;
            } else
            if (location.pathname.includes("/notify")) {
                document.title = `Уведомления | planhelp`;
            }
        }
    },[Chat.chatDialogList]);

    // Показываем бейдж с кол-во непрочитаных пушей
    const BadgeCountNotification = () => {
        return (
        <>
        { User.profile.notify_count ? 
            <span className="position-absolute top-45 start-100 translate-middle badge rounded-pill bg-danger" style={{ marginTop: '5px' }} > 
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
        <NavBar expand="md" bg="light" variant="light" 
            style={{borderRadius:"0px 0px 8px 8px", paddingLeft: "8px", paddingRight:"16px"}}>
            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link 
                    as={Link} 
                    to="/disk" 
                    active={location.pathname.includes("/disk") || location.pathname == "/"}
                >
                    Документы
                </Nav.Link>
                </Nav.Item>
            </Nav>
            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link as={Link} to="/project" active={location.pathname.includes("/project")}>Проекты</Nav.Link>
                </Nav.Item>
            </Nav>
            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link as={Link} to="/calendar" active={location.pathname.includes("/calendar")}>Календарь</Nav.Link>
                </Nav.Item>
            </Nav>
            {/* {countUnreadMessages > 0 ? <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link as={Link} to="/chat" active={location.pathname.includes("/chat")}>
                    Чат <Badge pill bg="danger">{ countUnreadMessages }</Badge>
                        
                </Nav.Link>
                </Nav.Item>
            </Nav> : ""} */}
            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/chat" 
                  active={location.pathname.includes("/chat")}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  Чат {countUnreadMessages?<Badge pill bg="danger">{ countUnreadMessages }</Badge>:""}
                </Nav.Link>
                </Nav.Item>
            </Nav>

            <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/better_chat" 
                  active={location.pathname.includes("/better_chat")}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    Чат (бета) {countUnreadMessages?<Badge pill bg="danger">{ countUnreadMessages }</Badge>:""}
                </Nav.Link>
                </Nav.Item>
            </Nav>
            {/* <Nav className='justify-content-left'>
                <Nav.Item>
                <Nav.Link as={Link} to="/hr" active={location.pathname.includes("/hr")}>Люди</Nav.Link>
                </Nav.Item>
            </Nav> */}

            <NavBar.Collapse className="justify-content-end">
                <Nav.Item>
                <Dropdown>
                    {User.isOnline ? 
                        <small className='text-success'>онлайн </small> :
                        <><small className='text-danger'>оффлайн </small><Spinner animation="grow" variant="warning" size="sm" /></>
                    }
                    
                    <Dropdown.Toggle variant="link" bsPrefix="p-0">
                        <img className='rounded-circle' src={User.profile.avatar_url ? User.profile.avatar_url : ProfileIcon} width="40" height="40"/>
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
                        <Dropdown.Item href='/logout'> Выйти </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Nav.Item>
            </NavBar.Collapse>
        </NavBar>
        </>
    )
}