import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

function ModalOneInputText(props) {
    
    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        props.callBack(e.target.modalText.value);
    }

    return (
    <Modal show={props.show} onHide={closeMe}>
    <form onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3" controlId="modalText">
                <Form.Control
                    type={props.type?props.type:"text"}
                    defaultValue={props.defaultValue}
                    placeholder={props.placeholder}
                    autoFocus/>
            </Form.Group>                
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


export default ModalOneInputText;