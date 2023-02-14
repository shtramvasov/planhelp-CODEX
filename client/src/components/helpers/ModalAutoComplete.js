import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function ModalAutoComplete(props) {

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e,return_val) => {
        e.preventDefault();
        props.callBack(return_val);
    }
    let timeoutID;
    const onTextChange = (e) => {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            props.fetcher(e.target.value,()=>{});
            console.log(props.data);
          }, "1000");
    }
    const elementItems = props.data.map((el) =>
        <ListGroup.Item key={el.return_val} 
            action
            onClick={(e) => {saveMe(e,el.return_val)}}>
                <div style={{float: "left"}}>
                    {el.display_val}
                </div>
                {props.defaultVal == el.return_val?
                <div style={{float:"right"}}>
                    <i className="bi bi-check-circle-fill"></i>
                </div>
                :
                <div style={{float:"right"}}>
                    <i className="bi bi-check-circle"></i>
                </div>
                }
        </ListGroup.Item>
    );
    
    return (
    <Modal show={props.show} onHide={closeMe}>
    <Container>
        <Row>
            <Col>
                <form onSubmit={saveMe}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="modalText">
                            <Form.Control
                                type={props.type?props.type:"text"}
                                autoFocus
                                placeholder={props.placeholder}
                                onChange={onTextChange}/>
                        </Form.Group>   
                        <ListGroup >
                            {elementItems}
                        </ListGroup>
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
            </Col>
        </Row>
    </Container>
    </Modal>
    );
}


export default ModalAutoComplete;