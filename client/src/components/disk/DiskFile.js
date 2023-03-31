import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalNote from "../helpers/ModalNote";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addEntity, addEntityNotes, addEntityNote } from '../../reducers/Disk';
import { useNavigate } from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity } from '../../network/DiskNetwork';
import { getEntityNoteList, postEntityNote } from '../../network/NoteNetwork';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown' 
import Card from 'react-bootstrap/Card';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function DiskFile(props) {
    const { entity_id , mode} = useParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();

    document.title = Disk.entity.entity_name+" | planhelp";

    const [showModalNote, setShowModalNote] = useState(false);

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const fetchEntityNoteList = () => {
        getEntityNoteList({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityNotes(resp));    
            } else {    
                alert("Ошибка: "+err);
            }
        });
    }

    const deleteEntity = () => {
        deletetDiskEntity({entity_id}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        })
    }

    const handleEditClick = () => {
        navigate(`/disk/${entity_id}/file/edit`);
    }

    const handleCancelClick = () => {
        navigate(`/disk/${entity_id}/file/read`);
    }

    const handleDeleteClick = () => {
        deleteEntity();
    }

    const handleBackClick = () => {
        navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
    }

    const handleInfoEntity = () => {
        navigate(`/disk/${entity_id}/activity`);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        postDiskEntity(
            {   
                entity_id : entity_id,
                entity_name : e.target.formEntityName.value,
                entity_note : e.target.formEntityNote.value,
                // parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    handleCancelClick();
                    fetchEntity();
                }
            }
        );
    }

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
        fetchEntityNoteList();
    },[entity_id]);

    // Вызов модалки создания файла
    const actionCallModalNote = (e) => {
        e.preventDefault();
        dispatch(addEntityNote({}));
        setShowModalNote(true);
    }

    // Колбэк с модалки после создания файла
    const actionModalNoteCallback = (commonNote) => {
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        setShowModalNote(false);
        dispatch(addEntityNote({}));
        if (!commonNote) {
            return;
        }
        
        const {note, remind_on, variant, note_id, is_deleted} = commonNote;
        if (!is_deleted)
            if (!commonNote.note) {
                return;
            }
        
        postEntityNote({
                entity_id : entity_id,
                note : note,
                remind_on : remind_on?
                    moment(remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
                    :
                    null,
                variant : variant,
                note_id : note_id,
                is_deleted : is_deleted
            },
            (err,resp) => {
                if (!err) {
                    fetchEntityNoteList();
                } else {
                    alert("Ошибка: "+err);
                }
            });
    }

    const onEditNote = (e,el) => {
        e.preventDefault();
        dispatch(addEntityNote(el));
        setShowModalNote(true);
    }

    const entityNoteItems = Disk.entityNotes.map((el) => 
        <Card key={el.note_id} onClick={(e) => onEditNote(e,el)}
              style={{fontSize:"0.8em", marginBottom:"8px", cursor:"pointer"}}
              bg={el.variant} 
              text={el.variant?(el.variant==="light"?"":"light"):""}
              >
            <Card.Body style={{padding:"8px 8px 4px 8px"}}>
                    <Card.Text>
                    {el.note}
                    </Card.Text>
            </Card.Body>
            <div style={{textAlign:"right", padding:"0px 8px 8px 0px"}}>
                <small>
                    {moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()} 
                    ({el.login})<br/>
                    {el.remind_on?"напомнить "+moment(el.remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('Do MMMM YYYY, в HH:mm:ss'):""}
                </small>
            </div>
        </Card>
    );
    
    return (
    <Container>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Disk.entityNote} />
    <Row>
        <Col>
            <Navbar />
            <hr/>            
        </Col>
    </Row>
    {mode==="read"?
    <div>
        
    <Row>
        <Col>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="button" onClick={handleBackClick} variant="outline-secondary" ><i className="bi bi-chevron-left"></i></Button>   
                <Button style={{marginLeft : "2px"}} type="button" onClick={handleEditClick} variant="outline-secondary" >Изменить файл</Button>   
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleInfoEntity}><i className="bi bi-info-circle"></i></Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-primary" onClick={actionCallModalNote}><i className="bi bi-calendar2-plus"></i></Button>
            </Form.Group>
        </Col>
    </Row>    
    <Row>
        <Col>
            <h2>{Disk.entity.entity_name}</h2>
        </Col>
    </Row>
    <Row>
        <Col style={{whiteSpace: "pre-wrap"}}>
            <ReactMarkdown children={ Disk.entity.entity_note } ></ReactMarkdown>
        </Col>
        <Col lg={3}>
            {entityNoteItems}
            <div style={{textAlign: "center"}}>
                <a href="#" onClick={actionCallModalNote} className="phLink">Добавить заметку</a>
            </div>
        </Col>
    </Row>
    </div>
    :
    <form onSubmit={handleSubmit}>
    <Row>
        <Col>
            <Form.Group className="mb-3">
            <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary"onClick={handleCancelClick} ><i className="bi bi-chevron-left"></i></Button>
                <Button style={{marginLeft : "2px"}} type="submit" variant="outline-success" >Сохранить изменения</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={handleDeleteClick}><i className="bi bi-trash"></i></Button>
            </Form.Group>
        </Col>
    </Row>  
    <Row>
        <Col>
            <Form.Group className="mb-3" controlId="formEntityName">
            <Form.Control 
                controlid="formEntityName"
                defaultValue={Disk.entity.entity_name} 
                type="text" 
                placeholder="Название" />
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <div>
            <Form.Group className="mb-3" controlId="formEntityNote">
            <Form.Control
                as="textarea"
                defaultValue={Disk.entity.entity_note?Disk.entity.entity_note:""} 
                rows="40"
                style={{marginTop: "10px",width: "100%", border : "1px solid silver", padding : "15px"}}
            />
            </Form.Group>
            </div>
        </Col>
    </Row>
    </form>
    }
    </Container>
    );
}


export default DiskFile;