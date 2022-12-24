import { useDispatch } from 'react-redux'
import { logout } from '../../reducers/User'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export function Logout(props) {
    const dispatch = useDispatch()
    dispatch(logout());
    window.location.href = "/login";
    return (
        <div/>
    // <Container>
    // <Row className="justify-content-md-center">
    //     <Col xs={4}>
    //         <br/><br/>
    //         <strong>Выхожу из системы...</strong>
    //     </Col>
    // </Row>
    // </Container>
    );
}