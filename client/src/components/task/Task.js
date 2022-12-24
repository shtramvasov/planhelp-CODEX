import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Task(props) {
    console.log("Task render");
    return (
    <Container>
    <Row>
        <Col>
            <Navbar />
            <hr/>
            <div>
                Задачи
            </div>
        </Col>
    </Row>
    </Container>
    );
}


export default Task;