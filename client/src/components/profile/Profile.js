import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addProfile } from '../../reducers/User';
import { useNavigate , useSearchParams} from "react-router-dom";
import { getUserProfile, postUserProfile } from '../../network/UserNetwork';
import { useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

function Profile(props) {
    const dispatch = useDispatch()
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [showModalChangePassword, setShowModalChangePassword] = useState(false);
    const [showModalChangeEmail, setShowModalChangeEmail] = useState(false);
    const [showModalChangeTlgrm, setShowModalChangeTlgrm] = useState(false);
    const [showModalChangeTimezone, setShowModalChangeTimezone] = useState(false);
    const [showModalChangeUsername, setShowModalChangeUsername] = useState(false);

    const initValues = [
        {display_val:"Калининград (мск-1)",return_val:"+2:00"},
        {display_val:"Москва",return_val:"+3:00"},
        {display_val:"Самара (мск+1)",return_val:"+4:00"},
        {display_val:"Екатеринбург (мск+2)",return_val:"+5:00"},
        {display_val:"Омск (мск+3)",return_val:"+6:00"},
        {display_val:"Красноярск (мск+4)",return_val:"+7:00"},
        {display_val:"Иркутск (мск+5)",return_val:"+8:00"},
        {display_val:"Якутск (мск+6)",return_val:"+9:00"},
        {display_val:"Владивосток (мск+7)",return_val:"+10:00"},
        {display_val:"Магадан (мск+8)",return_val:"+11:00"},
        {display_val:"Камчатка (мск+9)",return_val:"+12:00"}
    ];
    const [stateOptions, setStateValues] = useState(initValues);
    
    const fetchUserProfile = () => {
        getUserProfile({},(err,resp) => {
            if (!err) {
                dispatch(addProfile(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const fetchTimezone = (search, cb) => {
        if (!search) {
            setStateValues(initValues);
            return;
        }
        const filtered = initValues.filter(
            el => el.display_val.toUpperCase().indexOf(search.toUpperCase()) >= 0 
        );
        setStateValues(filtered);
    }

    // Первичная загрузка данных
    useEffect(() => {
        // fetchUserProfile();
    },[]);

    // Вызов модалки смены пароля
    const actionChangePassword = (e) => {
        e.preventDefault();
        setShowModalChangePassword(true);
    }
    // Вызов модалки смены email
    const actionChangeEmail = (e) => {
        e.preventDefault();
        setShowModalChangeEmail(true);
    }
    // Вызов модалки смены телеграм ид
    const actionChangeTlgrm = (e) => {
        e.preventDefault();
        setShowModalChangeTlgrm(true);
    }
        // Вызов модалки смены телеграм ид
    const actionChangeTimezone = (e) => {
        e.preventDefault();
        setShowModalChangeTimezone(true);
    }

       // Вызов модалки смены телеграм ид
    const actionChangeUsername = (e) => {
        e.preventDefault();
        setShowModalChangeUsername(true);
    }

    // Колбэк с модалки после изменения пароля
    const actionChangePasswordCallBack = (password) => {
        setShowModalChangePassword(false);
        if (!password) return;
        postUserProfile({secret:password},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }
    // Колбэк с модалки после изменения email
    const actionChangeEmailCallBack = (email) => {
        setShowModalChangeEmail(false);
        // if (!email) return;
        postUserProfile({email:email},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    const actionChangeUsernameCallBack = (username) => {
        setShowModalChangeUsername(false);
        postUserProfile({username:username},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    // Колбэк с модалки после изменения telegram chat id
    const actionChangeTlgrmCallBack = (telegram_chat_id) => {
        setShowModalChangeTlgrm(false);
        // if (!telegram_chat_id) return;
        postUserProfile({telegram_chat_id:telegram_chat_id},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }
    // Колбэк с модалки после изменения timezone
    const actionChangeTimezoneCallBack = (timezone) => {
        setShowModalChangeTimezone(false);
        fetchTimezone("");
        postUserProfile({timezone:timezone},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }
    const actionChangeNotifySwitch = (e) => {
        postUserProfile({is_notify:e.target.checked?1:0},(err,resp) => {
            if (!err) {
                fetchUserProfile();
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    return (
    <Container fluid>
    <ModalOneInputText 
        title={"Новый пароль"} 
        type="password"
        show={showModalChangePassword} 
        callBack={actionChangePasswordCallBack}
        placeholder="Укажите новый пароль" />
    <ModalOneInputText 
        title={"Ваше имя"} 
        type="input"
        show={showModalChangeUsername} 
        placeholder="Укажите ваше имя"
        callBack={actionChangeUsernameCallBack} />
    <ModalOneInputText 
        title={"Новый email"} 
        type="email"
        show={showModalChangeEmail} 
        callBack={actionChangeEmailCallBack}
        placeholder="Укажите новый адрес электронной почты" />
    <ModalOneInputText 
        title={"Новый telegram chat id"} 
        type="input"
        show={showModalChangeTlgrm} 
        placeholder="Укажите telegram chat id"
        callBack={actionChangeTlgrmCallBack} />
    <ModalAutoComplete 
        title={"Временная зона"} 
        type="input"
        show={showModalChangeTimezone} 
        placeholder="Начните набирать для поиска"
        callBack={actionChangeTimezoneCallBack}
        fetcher={fetchTimezone}
        defaultVal={User.profile.timezone}
        data={stateOptions}
        />
    <Row>
        <Col>
            <Navbar />
            <hr/>
        </Col>
    </Row>
    <Row>
        <Col>         
            <small>Это вы</small>
            <h2>{User.profile.login}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <small>Ваше имя</small>
            &nbsp;<a href="#" onClick={actionChangeUsername}><i className="bi bi-pencil-square"></i></a>
            <h2>{User.profile.username ? User.profile.username : "-"}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <small>Часовой пояс</small>
            &nbsp;<a href="#" onClick={actionChangeTimezone}><i className="bi bi-pencil-square"></i></a>
            <h4>{initValues.filter(el=>el.return_val === User.profile.timezone)[0]?.display_val}</h4>
        </Col>
    </Row>
    <Row>
        <Col>
            <br/>
        </Col>
    </Row>
    <Row style={{marginBottom: "0.5rem"}}>
        <Col>
            <small>Email</small>
            &nbsp;<a href="#" onClick={actionChangeEmail}><i className="bi bi-pencil-square"></i></a>
            <h4>{User.profile.email?User.profile.email:"-"}</h4>
        </Col>
    </Row>
    <Row style={{marginBottom: "0.5rem"}}>
        <Col>
            <small>Telegram chat id</small>
            &nbsp;<a href="#" onClick={actionChangeTlgrm}><i className="bi bi-pencil-square"></i></a>
            <br/>
            <small><a href="https://t.me/planhelpbot" className="phLink">Узнать свой chat_id</a></small>
            <h4>{User.profile.telegram_chat_id?User.profile.telegram_chat_id:"-"}</h4>
        </Col>
    </Row>
    <Row style={{marginBottom: "0.5rem"}}>
        <Col>
        <Form>
            <Form.Check 
                type="switch"
                id="custom-switch"
                label="Получать уведомления по email и в telegram"
                onChange={actionChangeNotifySwitch}
                checked={User.profile.is_notify===1?true:false}
            />
        </Form>
        </Col>
    </Row>

    <Row style={{marginBottom: "0.5rem"}}>
        <Col>
            <small>Пароль</small>
            &nbsp;<a href="#" onClick={actionChangePassword}><i className="bi bi-pencil-square"></i></a>
            <h4><span>********</span></h4>
        </Col>
    </Row>
    <Row>
        <Col>
            <br/>
            <a href="/logout" className="phLink">Выйти из системы</a>
        </Col>
    </Row>
    </Container>
    );
}


export default Profile;