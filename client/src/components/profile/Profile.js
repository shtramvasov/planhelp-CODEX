import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Profile(props) {
    console.log("Profile render");
    return (
    <Container>
    <Row>
        <Col>
            <Navbar />
            <hr/>
            <div>
                Профиль
            </div>
        </Col>
    </Row>
    </Container>
    );
}


export default Profile;