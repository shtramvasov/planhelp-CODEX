import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { uploadFile } from '../../network/DiskNetwork';
import { useSelector, useDispatch } from 'react-redux';
import { messages } from "../constants/Msg";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';


// гребанное дерьмо, котороый хер пойми как работало ранее
// если что смотри историю коммитов
// последняя правка тк в чатах не работало
// selectedFile был объявлен как var - вынес его через useState() и заработало

function ModalInputFile(props) {
    
    const dispatch = useDispatch();
    const [isLoadFile, setLoadFile] = useState(0)
    const [selectedFile, setSelectedFile] = useState(null);

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        setLoadFile(1);
        fetchUploadFile(selectedFile.file);
    }

    const selectFile = (e) => {
        e.preventDefault()
        setSelectedFile({ 'file': e.target.files[0] })
    }

    // Загружаем файл
    const fetchUploadFile = (file) => {
        uploadFile({ file }, (err, response) => {
            setLoadFile(0);
            if (!err) {
                props.callBack(response);
            } else {
                dispatch(addNegativeMessage(messages.UPLOAD_FAIL));
            }
        })
    }
    
    return (
    <Modal show={props.show} onHide={closeMe}>
        {/* encType='multipart/form-data' */}
    <form onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3" controlId="modalText">
                <Form.Control
                    type='file'
                    name='uploaded_file'
                    onChange={selectFile}
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
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </Button>
            }
        </Modal.Footer>    
    </form>
    </Modal>
    );
}


export default ModalInputFile;