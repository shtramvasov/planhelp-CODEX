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
        fetchUserProfile();
    },[]);

    // Вызов модалки создания папки
    const actionChangePassword = (e) => {
        e.preventDefault();
        setShowModalChangePassword(true);
    }
    // Колбэк с модалки после создания папки
    const actionChangePasswordCallBack = (password) => {
        setShowModalChangePassword(false);
        if (!password) return;
        postUserProfile({secret:password},(err,resp) => {
            if (!err) {
                // dispatch(addProfile(resp));    
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
        callBack={actionChangePasswordCallBack} />
    <Row>
        <Col>
            <Navbar />
            <hr/>
        </Col>
    </Row>
    <Row>
        <Col>
            <h2>{User.profile.login}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <br/>
            <Button type="button" variant="outline-success" onClick={actionChangePassword}>Изменить пароль</Button>
        </Col>
    </Row>
    </Container>
    );
}


export default Profile;