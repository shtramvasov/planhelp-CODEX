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
                <strong className="me-auto">Файл загрузили</strong>
            </Toast.Header>
            
            <Toast.Body>
                <Table striped bordered hover>
                    <tbody>
                    <tr style={{ verticalAlign: 'middle' }} >
                        <td> {props.file.original_name} </td>
                        <td> {props.file.size} Кб </td>
                    </tr>
                    </tbody>
                </Table>
            </Toast.Body>

        </Toast>
    </ToastContainer> 
    )
}

export default ToastMessage;