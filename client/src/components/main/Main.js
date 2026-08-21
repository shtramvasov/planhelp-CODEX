import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Main(props) {
    console.log("Main render");
    return (
    <Container>
    <Row>
        <Col>
            <Navbar />
            <hr/>
            <div>
                Главная
            </div>
        </Col>
    </Row>
    </Container>
    );
}


export default Main;