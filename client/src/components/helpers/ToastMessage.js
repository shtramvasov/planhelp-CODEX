import React from 'react';
import { Table, Toast, ToastContainer } from 'react-bootstrap';

function ToastMessage(props) {

    const closeMe = () => {
        props.callBack();
    }
    
    return (
        <ToastContainer position='bottom-end'>
        <Toast onClose={closeMe}>
        
            <Toast.Header>
                <strong className="me-auto"> {props.title} </strong>
            </Toast.Header>
            
            <Toast.Body>
                { props.body() }
            </Toast.Body>

        </Toast>
    </ToastContainer>
    )
}

export default ToastMessage;