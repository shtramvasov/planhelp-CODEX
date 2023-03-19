import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { uploadFile } from '../../network/DiskNetwork';
import { useSelector } from 'react-redux';

function ModalInputFile(props) {
    
    var selectedFile;
    const Disk = useSelector((state) => state.disk);
    const [isLoadFile, setLoadFile] = useState(0)

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        setLoadFile(1);
        fetchUploadFile(Disk.entity.entity_id, selectedFile.file)
    }

    selectedFile = (e) => {
        e.preventDefault()
        selectedFile = { 'file': e.target.files[0] }
    }

    // Загружаем файл
    const fetchUploadFile = (entity_id, file) => {
        uploadFile({ entity_id, file }, (err, response) => {
            setLoadFile(0);
            if (!err) {
                console.log('Response Upload File: ', response)
                props.callBack(response);
            } else {
                alert("Ошибка: " + err);
            }
        })
    }
    
    return (
    <Modal show={props.show} onHide={closeMe}>
    <form encType='multipart/form-data' onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3" controlId="modalText">
                <Form.Control
                    type='file'
                    name='uploaded_file'
                    onChange={selectedFile}
                />
            </Form.Group>                
        </Modal.Body>
        <Modal.Footer>
            {
                !isLoadFile ? 
                <Button variant="outline-primary" type="submit">
                    Загрузить
                </Button> :
                <Button> 
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </Button>
            }
        </Modal.Footer>    
    </form>
    </Modal>
    );
}


export default ModalInputFile;