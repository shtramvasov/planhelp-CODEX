import { Navbar }  from "../navbar/Navbar";
import { Container, Button, Row, Col, Form, Table } from "react-bootstrap";
import ModalNote from "../helpers/ModalNote";
import ModalInputFile from "../helpers/ModalInputFile";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addEntity, addEntityNotes, addEntityNote, addLastUploadFile } from '../../reducers/Disk';
import { useNavigate } from "react-router-dom";
import { getDiskEntity, postDiskEntity, deleteDiskEntity } from '../../network/DiskNetwork';
import { getEntityNoteList, postEntityNote } from '../../network/NoteNetwork';
import { useParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Breadcrumb from "../helpers/Breadcrumb";
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { messages } from "../constants/Msg";

// Обработчик markdown 
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";
// Редактор markdown
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

// Отключаем плагины редактирвоания, которые не работают
// - Подчеркивание (не работает)
MdEditor.unuse(Plugins.FontUnderline)
// - Блок цитата (не работает)
MdEditor.unuse(Plugins.BlockQuote)
// - Фулл скрин (не нужен)
MdEditor.unuse(Plugins.FullScreen)

moment.locale('ru');

// это барахло вынесено отдельно тк иначе происходит постоянный перерендер
// Создаем объект <table> со стилями bootstrap, для использования его в markdown
const MarkdownTable = props => {
    return (<table className="table table-bordered"> {props.children} </table>)
}

const MarkdownObject = (props) => {
    // 1. components: прокидываем свои html объекты
    // 2. children: markdown -> стилевый текст
    // 3. remarkPlugins: плагины для поддержки таблиц, стилей текста
    return <ReactMarkdown components={{ table: MarkdownTable }} children={ props.value } remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} /> 
}

function DiskFile(props) {
    const { entity_id , mode} = useParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [showModalNote, setShowModalNote] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);
    const [entityNote, setEntityNote]  = useState("");

    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));    
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    };

    const fetchEntityNoteList = () => {
        getEntityNoteList({entity_id : entity_id},(err,resp) => {
            if (!err) {
                dispatch(addEntityNotes(resp));    
            } else {    
                dispatch(addNegativeMessage(err));
            }
        });
    }

    const deleteEntity = () => {
        const selectedEntityIdList = [];
        selectedEntityIdList.push(entity_id);
        deleteDiskEntity({selectedEntityIdList}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        })
    }

    const handleEditClick = () => {
        // 1. Прокидываем содержимое entity в форму с изменением
        setEntityNote(Disk.entity.entity_note?Disk.entity.entity_note:"")
        // 2. Переход в роут Изменение файла
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
                entity_note : entityNote,
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
    // Вызов модалки загрузки файла
    const actionCallModalUploadFile = (e) => {
        e.preventDefault();
        setShowModalUploadFile(true);
    }

    // Колбэк с модалки после создания файла
    const actionModalNoteCallback = (commonNote) => {

        setShowModalNote(false);
        dispatch(addEntityNote({}));
        if (!commonNote) {
            return;
        }
        
        const {note, remind_on, variant, note_id, note_type, note_2, is_deleted, is_remind} = commonNote;
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
                note_type : note_type,
                note_2 : note_2,
                is_deleted : is_deleted,
                is_remind : is_remind
            },
            (err,resp) => {
                if (!err) {
                    fetchEntityNoteList();
                } else {
                    dispatch(addNegativeMessage(err));
                }
            });
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
        if (!file) {
            return;
        }
        dispatch(addLastUploadFile(file));
       
        postEntityNote({
            entity_id : entity_id,
            note : file.name,
            note_2 : file.url,
            note_type : "FILE",
            variant : "",
            is_deleted : 0
        },
        (err,resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchEntityNoteList();
            } else {
                dispatch(addNegativeMessage(messages.UPLOAD_FAIL));
            }
        });
    }

    const onEditNote = (e,el) => {
        
        e.preventDefault();
        dispatch(addEntityNote(el));
        // if (el.note_type==="COMMENT") {
        setShowModalNote(true);
        // } else {
        //     window.location.href = el.note_2;
        // }
    }

    const entityNoteItems = Disk.entityNotes.map((el) => 
        <Card key={el.note_id} onClick={(e) => onEditNote(e,el)}
              style={{fontSize:"0.8em", marginBottom:"8px", cursor:"pointer"}}
              bg={el.variant} 
              text={el.variant?(el.variant==="light"?"":"light"):""}
              >
            <Card.Body style={{padding:"8px 8px 4px 8px"}}>
                    <Card.Text>
                    {el.note_type === "COMMENT" ? 
                        el.note : <a href={el.note_2} className="phLink">{el.note}</a>}
                    </Card.Text>
            </Card.Body>
            <div style={{textAlign:"right", padding:"0px 8px 8px 0px"}}>
                <small> 
                    {moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()} 
                    ({el.login})<br/>
                    {el.remind_on? (el.is_remind?"напомнить ":"")+moment(el.remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('Do MMMM YYYY, в HH:mm:ss'):""}
                </small>
            </div>
        </Card>
    );


    const handleEditorChange = ({ html, text }) => {
        setEntityNote(text)
    }

    // Панель действий
    const ActionBar = (info) => {
        return (
            <Row>
                <Col>
                    <Form.Group className="mb-3">
                        <Button style={{marginLeft : "2px"}} type="button" onClick={handleBackClick} variant="outline-secondary" ><i className="bi bi-chevron-left"></i></Button>   
                        {/* Скрываем действия с файлами если права пользователя только чтение  */}
                        { info.user_role != "READ" ? 
                        <>
                        <Button style={{marginLeft : "2px"}} type="button" onClick={handleEditClick} variant="outline-secondary" >Изменить файл</Button>   
                        <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleInfoEntity}><i className="bi bi-info-circle"></i></Button>
                        <Button style={{marginLeft : "2px"}} type="button" variant="outline-primary" onClick={actionCallModalNote}><i className="bi bi-calendar2-plus"></i></Button>
                        <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalUploadFile}>
                            <i className="bi bi-cloud-arrow-up"></i> 
                        </Button>
                        </> : "" }
                    </Form.Group>
                </Col>
            </Row>
        )
    }

    return (
    <Container fluid>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Disk.entityNote}
            conditionalRemindDateTime={true} />
        <ModalInputFile 
            title={"Загрузить файл"} 
            show={showModalUploadFile} 
            callBack={actionUploadFileCallBack}  />
    <Row>
        <Col>
            <Navbar />
            <hr/>            
        </Col>
    </Row>
    <Row>
        <Col>
        <Breadcrumb 
            items={Disk.entity.breadcrumb?.map(
                (item, i) => {return {url:`/disk/${item.entity_id}`, name: item.entity_name}})}
        />
        </Col>
    </Row>
    {mode==="read"?
    <div>    
    <ActionBar user_role = { Disk.entity.user_role } />
    
    <Row>
        <Col>
            <h2>{Disk.entity.entity_name}</h2>
        </Col>
    </Row>
    
    <Row className="p-2 mt-0 pt-0">
        <Col lg={10} className="shadow p-3 bg-white rounded">
            {/* hack for \n for reactMarkdown replace(/\n/gi, '  \n') */}
            {/* replace all \n for space + space + \n */}
            {Disk.entity.entity_note?
                <MarkdownObject value = {(Disk.entity.entity_note)?.replace(/\n/gi, '  \n')} />:""
            }
        </Col>
        <Col lg={2}>
            <span style={{fontSize: "0.9em",marginLeft:"8px", color: "#555"}}>
                <b>Еще файлы в папке:</b>
            </span>
            <hr style={{marginBottom: "8px",marginTop: "8px"}}/>
            <ul className="phUl">
            {Disk.entity.levelEntityList?.map((el)=>{
                if (["FILE","GRID"].includes(el.entity_type)) 
                    return (
                        <li key={el.entity_id} className={el.entity_id == entity_id ? "active" : 'notactive'}>
                            <a onClick={(e)=>{ 
                                    e.preventDefault(); 
                                    if (el.entity_type == "FILE") navigate(`/disk/${el.entity_id}/file/read`); 
                                    else
                                    if (el.entity_type == "GRID") navigate(`/disk/${el.entity_id}/spreadsheet`); 
                                }}
                                href={`/disk/${el.entity_id}/file/read`}>
                                    {el.entity_name}
                            </a>
                        </li>
                    );
            })}
            </ul>
        </Col>
    </Row>
    
    <Row className="mt-2">
        <Col lg={6}>
            {entityNoteItems}
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
            <MdEditor view={{menu: true, md: true, html: false}}  onChange={handleEditorChange} value={entityNote}  style={{ height: '500px' }} renderHTML={ text => <MarkdownObject value = {text} /> } />
        </Col>
    </Row>
    </form>
    }
    </Container>
    );
}


export default DiskFile;