import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from "react";
import { login, logout } from '../../reducers/User'
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { postLogin } from '../../network/LoginNetwork';

export function Login(props) {
    const dispatch = useDispatch()
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();

    const checkLoginAndPassword = (e) => {
        e.preventDefault();
        postLogin({
            login : e.target.formBasicLogin.value,
            password : e.target.formBasicPassword.value
        },(err,resp) => {
            if (!err) {
                dispatch(login(resp.secret));
                navigate("/");        
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    return (
    <Container>
        <Row className="justify-content-md-center">
            <Col xs={4}>
                <br/><br/>
                <form onSubmit={checkLoginAndPassword}>
                    <Form.Group className="mb-3" controlId="formBasicLogin">
                        <Form.Label>Логин</Form.Label>
                        <Form.Control type="text" placeholder="Имя пользователя" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control type="password" placeholder="Пароль" />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Войти
                    </Button>
                </form>
            </Col>
        </Row>
    </Container>
    )
}