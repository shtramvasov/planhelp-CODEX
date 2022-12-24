import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Hr(props) {
    console.log("Hr render");
    return (
    <Container>
    <Row>
        <Col>
            <Navbar />
            <hr/>
            <div>
                HR
            </div>
        </Col>
    </Row>
    </Container>
    );
}


export default Hr;