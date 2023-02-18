import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function ModalNote(props) {
        
    // свитчер напоминания
    const [isRemind, setRemind] = useState(false);

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        let remind_on;
        if (e.target.remind_date?.value && e.target.remind_time?.value) {
            remind_on = e.target.remind_date?.value 
                + ' ' + e.target.remind_time?.value+":00";
            // // const dateParts = e.target.remind_date?.value.split('.');
            // console.log(e.target.remind_date?.value);
            // remind_on = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
            // // remind_on+= ' '+e.target.remind_time?.value+":00"
        }
        
        props.callBack({
            note : e.target.modalText.value,
            remind_on : remind_on
        });
    }

    return (
    <Modal show={props.show} onHide={closeMe}>
    <form onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3" controlId="modalText">
                <Row>
                    <Col>
                    <Form.Control
                        type="text"
                        as="textarea"
                        placeholder={props.placeholder}
                        autoFocus/>
                    </Col>
                </Row>
            </Form.Group>
                <Row style={{marginTop: "10px"}}>
                    <Col>
                    <Form.Check 
                        type="switch"
                        id="custom-switch"
                        label="Напомнить"
                        onChange={(e) => {setRemind(e.target.checked)}}
                        checked={isRemind}
                    />
                    </Col>
                </Row>
                {isRemind?
                <Row style={{marginTop: "10px"}}>
                    <Col>
                        <Form.Control type="date" id="remind_date"/>
                    </Col>
                    <Col>
                        <Form.Control type="time" id="remind_time"/>
                    </Col>
                </Row>:""
                }
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={closeMe}>
                Закрыть
            </Button>
            <Button variant="outline-primary" type="submit">
                Сохранить
            </Button>
        </Modal.Footer>    
    </form>
    </Modal>
    );
}


export default ModalNote;