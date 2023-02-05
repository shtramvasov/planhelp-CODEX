import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
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
    
    const fetchUserProfile = () => {
        getUserProfile({},(err,resp) => {
            if (!err) {
                dispatch(addProfile(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // Первичная загрузка данных
    useEffect(() => {
        // fetchUserProfile();
    },[]);

    // Вызов модалки создания папки
    const actionChangePassword = (e) => {
        e.preventDefault();
        setShowModalChangePassword(true);
    }
    // Вызов модалки создания папки
    const actionChangeEmail = (e) => {
        e.preventDefault();
        setShowModalChangeEmail(true);
    }
    // Вызов модалки создания папки
    const actionChangeTlgrm = (e) => {
        e.preventDefault();
        setShowModalChangeTlgrm(true);
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
    <Container>
    <ModalOneInputText 
        title={"Новый пароль"} 
        type="password"
        show={showModalChangePassword} 
        callBack={actionChangePasswordCallBack}
        placeholder="Укажите новый пароль" />
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
            <br/>
            {/* navigate(`/disk?search=${e.target.formFindText.value}`); */}
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
            <a href="/logout" style={{textDecorationStyle:"dotted"}}>Выйти из системы</a>
        </Col>
    </Row>
    </Container>
    );
}


export default Profile;