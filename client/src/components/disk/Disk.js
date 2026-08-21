import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton} from 'react-bootstrap';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalInputFile from "../helpers/ModalInputFile";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { addEntity, addEntityFiles, addLastUploadFile } from '../../reducers/Disk';
import { selectEntity, clearSelectedEntityList } from '../../reducers/Disk';
import { useNavigate , useSearchParams} from "react-router-dom";
import { getDiskEntity, postDiskEntity, moveDiskEntity, deleteDiskEntity } from '../../network/DiskNetwork';
import { postEntityNote } from '../../network/NoteNetwork';
import { useParams } from 'react-router-dom';
import DragDropFile from "../helpers/DragDropFile";
import DiskRemindList from "./DiskRemindList";
import Breadcrumb from "../helpers/Breadcrumb";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { messages } from "../constants/Msg";

function Disk(props) {
    
    const { entity_id, mode } = useParams();
    const [ searchParams ] = useSearchParams();

    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

    const [showModalCreatePath, setShowModalCreatePath] = useState(false);
    const [showModalCreateFile, setShowModalCreateFile] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);
    const [showModalCreateSpreadsheet, setShowModalCreateSpreadsheet] = useState(false);
    
    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id, search : searchParams.get("search")},(err,resp) => {
            if (!err) {
                if (resp.entity_type==="FILE") {
                    navigate(`/disk/${entity_id}/file/read`);
                }
                dispatch(addEntity(resp));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    };
 
    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
    },[entity_id,searchParams.get("search")]);

    const getEntityUri = ({entity_type, entity_id}) => {
        switch(entity_type) {
            case "PATH":
                return `/disk/${entity_id?entity_id:""}`;
            case "FILE":
                return `/disk/${entity_id}/file/read`;
            case "GRID":
                return `/disk/${entity_id}/spreadsheet`;
            default:
                return ""
        }
    }

    // Поиск по диску, вызывается по enter на поле поиска
    const actionFindSubmit = (e) => {
        e.preventDefault();
        navigate(`/disk${entity_id?"/"+entity_id:""}?search=${e.target.formFindText.value}`);
    }

    // Вызов модалки создания папки
    const actionCallModalNewPath = (e) => {
        e.preventDefault();
        setShowModalCreatePath(true);
    }

    // Вызов модалки создания файла
    const actionCallModalNewFile = (e) => {
        e.preventDefault();
        setShowModalCreateFile(true);
    }

    // Вызов модалки создания таблицы
    const actionCallModalNewSpreadsheet = (e) => {
        e.preventDefault();
        setShowModalCreateSpreadsheet(true);
    }

    // Вызов модалки загрузки файла
    const actionCallModalUploadFile = (e) => {
        e.preventDefault();
        setShowModalUploadFile(true);
    }

    // Колбэк с модалки после создания папки
    const actionNewPathCallBack = (pathName) => {
        setShowModalCreatePath(false);
        if (!pathName) return;
        postDiskEntity(
            {
                entity_name : pathName,
                entity_note : null,
                parent_entity_id : Disk.entity.entity_id,
                entity_type : "PATH"
            }, 
            (err,resp) => {
                if (!err) {
                    fetchEntity();
                }
            }
        );
    }

    // Колбэк с модалки после создания файла
    const actionNewFileCallBack = (fileName) => {
        setShowModalCreateFile(false);
        if (!fileName) return;
        postDiskEntity(
            {
                entity_name : fileName,
                entity_note : null,
                parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    fetchEntity();
                }
            }
        );
    }
    
   // Колбэк с модалки после создания spreadsheet
   const actionNewSpreadsheetCallBack = (fileName) => {
        setShowModalCreateSpreadsheet(false);
        if (!fileName) return;
        postDiskEntity(
            {
                entity_name : fileName,
                entity_note : null,
                parent_entity_id : Disk.entity.entity_id,
                entity_type : "GRID"
            }, 
            (err,resp) => {
                if (!err) {
                    fetchEntity();
                }
            }
        );
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
        if (!file) return;
        
        dispatch(addLastUploadFile(file)); 

        // Адовая Дичь и лапша и говна которую надо переписать будет в будущем
        // нарушение атомарности 
        postDiskEntity(
            {
                entity_name : file.name,
                entity_note : null,
                parent_entity_id : Disk.entity.entity_id,
                entity_type : "FILE"
            }, 
            (err,resp) => {
                if (!err) {
                    fetchEntity();
                    // add file comment to entity
                    postEntityNote({
                        entity_id : resp.entity_id,
                        note : file.name,
                        note_2 : file.url,
                        note_type : "FILE",
                        variant : "",
                        is_deleted : 0
                    },
                    (err,resp) => {
                        if (!err) {
                            dispatch(addPositiveMessage(messages.SUCCESS));
                        } else {
                            dispatch(addNegativeMessage(messages.UPLOAD_FAIL));
                        }
                    });
                }
            }
        );
    }

    // Обработка клика по entity
    const handleClick = (e,entity_type,entity_id) => {
        
        if (e.target.id === "select-entity") {
            // Клик по чекбоксу entity
            dispatch(selectEntity(entity_id));
            return
        }
        e.preventDefault();
        navigate(getEntityUri({entity_type,entity_id}))
    }
     
    const handleEditEntity = () => {
        navigate(`/disk/${entity_id}/path/edit`);
    }

    const handleInfoEntity = () => {
        navigate(`/disk/${entity_id}/activity`);
    }

    const handleMoveSelectedEntityList = (e) => {
        moveDiskEntity({
            selectedEntityIdList : Disk.selectedEntityIdList,
            to_entity_id : entity_id
        }, (err, data) => {
            if (err) {
                alert(err);
                return;
            }
            fetchEntity();
            dispatch(clearSelectedEntityList());
        })
    }

    const handleDeleteSelectedEntityList = (e) => {
        deleteDiskEntity({
            selectedEntityIdList : Disk.selectedEntityIdList
        }, (err, data) => {
            if (err) {
                alert(err);
                return;
            }
            fetchEntity();
            dispatch(clearSelectedEntityList());
        })
    }

    var listItems = Disk.entity.childEntityList ? Disk.entity.childEntityList.map((el) =>
    // onClick={(e) => {handleClick(el.entity_type,el.entity_id)}} 
        <ListGroup.Item key={el.entity_id} 
            action href={getEntityUri(el)}
            onClick={(e) => {handleClick(e,el.entity_type,el.entity_id)}} 
            variant={el.entity_type === "PATH"?"success":""}
            >
            {el.user_role !== "READ" ?
            <Form style={{float:"left", marginRight:"10px"}}>
                <Form.Check className="custom-checkbox"
                    type="checkbox"
                    id="select-entity"
                    variant="secondary"
                    onChange={(e) => {}}
                    checked={Disk.selectedEntityIdList.includes(el.entity_id)}
                    />
            </Form>:""
            }
            {
                el.user_role !== "OWNER" ? <i className="bi bi-share"> </i>:
                el.entity_type === "PATH" ? <i className="bi bi-folder2"> </i> :
                    el.entity_type === "FILE" ? <i className="bi bi-file-earmark-text"> </i> :
                    <i style={{color : "#555"}} className="bi bi-table"> </i>

                            
            }
            {el.entity_name} {el.child_de_count?<Badge bg="success">{el.child_de_count}</Badge>:""}
        </ListGroup.Item>
    ):[];
    // Рут элемент
    // и возврат на пред уровень
    if (Disk.entity.entity_type !=='ROOT') {
        // 
        listItems.unshift(
            <ListGroup.Item 
                key={Disk.entity.parent_entity_id}
                action href={`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`}
                onClick={(e) => {handleClick(e,"PATH",Disk.entity.parent_entity_id)}} 
                >
                {Disk.entity.type === "PATH" ? <strong>..</strong> : <small>..</small>}    
            </ListGroup.Item>
        )
    }

    // Панель действий
    const ActionBar = (info) => {
        return (
            <>

            { info.user_role != "READ" ? 
            <>
                <Form.Group controlId="formFindText">
                    {/* Создать папку */}
                    <Button variant="outline-primary" onClick={actionCallModalNewPath}>
                    <i className="bi bi-folder-plus"></i>
                    </Button>
                    {/* Создать entity */}
                    <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalNewFile}>
                    <i className="bi bi-file-earmark-plus"></i>
                    </Button>
                    <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalNewSpreadsheet}>
                    <i className="bi bi-table"></i>
                    </Button>
                    {/* Загрузить файл */}
                    <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalUploadFile}>
                    <i className="bi bi-cloud-arrow-up"></i> 
                    </Button>

                    {/* Изменить папку */}
                    { entity_id ?
                    <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleEditEntity}>Изменить папку</Button>
                    :""}

                    {/* Свойства папки */}
                    {
                    Disk.entity.entity_type === "ROOT"?"":
                    <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleInfoEntity}><i className="bi bi-info-circle"></i></Button>
                    }
                    {/* Кол-во выбранных entity*/}
                    {
                    Disk.selectedEntityIdList.length > 0 ? 
                        <DropdownButton
                            style={{display:"inline",marginLeft : "2px"}}
                            title={"Выбрано "+Disk.selectedEntityIdList.length}
                            variant="">
                                <Dropdown.Header>Укажите действие для выбранных документов</Dropdown.Header>
                                <Dropdown.Item onClick={(e) => {dispatch(clearSelectedEntityList())}}>
                                    Отменить выбор
                                </Dropdown.Item>
                                <Dropdown.Item onClick={handleMoveSelectedEntityList}>
                                    Перенести в текущую папку {Disk.entity.entity_name !== ".."?<b>{Disk.entity.entity_name}</b>:""}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleDeleteSelectedEntityList}>
                                    Удалить
                                </Dropdown.Item>
                        </DropdownButton> 
                        : ""
                    }
                </Form.Group>
            </>
            : "" }
            </>
        )
    }

    const FilesContainer = () => {
        return(
            <>
                <ListGroup> {listItems} </ListGroup>
            </>
        )
    }

    return (
        
    <Container fluid>
        <ModalOneInputText title={"Новая папка"} show={showModalCreatePath} callBack={actionNewPathCallBack} />
        <ModalOneInputText title={"Новый файл"} show={showModalCreateFile} callBack={actionNewFileCallBack} />
        <ModalOneInputText title={"Новая таблица"} show={showModalCreateSpreadsheet} callBack={actionNewSpreadsheetCallBack} />
        <ModalInputFile title={"Загрузить файл"} show={showModalUploadFile} callBack= {actionUploadFileCallBack}  />
    <Row>
        <Col>
            <Navbar />
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col>
            <form onSubmit={actionFindSubmit}>
                <Form.Group controlId="formFindText">
                    <Form.Control type="text" 
                        placeholder={`${Disk.entity.entity_type === 'ROOT'?
                            "Поиск по всем документам": "Поиск в "+Disk.entity.entity_name}`}
                        defaultValue={searchParams.get("search")}
                    />
                </Form.Group>
            </form>
        </Col>
    </Row>
    {/* <Row style={{marginBottom:"16px"}}>
        <Col>
        <ul class="list-group list-group-horizontal">
            <a href="" class="list-group-item">Apple</a>
            <li class="list-group-item">Удобные решения</li>
            <li class="list-group-item">Еще что то довольно длинное</li>
        </ul>
        </Col>
    </Row> */}
    <Row style={{marginTop: "8px"}}>
        <Col>
            <Breadcrumb 
                items={Disk.entity.breadcrumb.map(
                    (item, i) => {return {url:`/disk/${item.entity_id}`, name: item.entity_name}})}
            />
        </Col>
    </Row>
    <Row>
        <Col>
            <ActionBar user_role = { Disk.entity.user_role } />
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col>
            <h2>{Disk.entity.entity_type === 'PATH'? Disk.entity.entity_name:""}</h2>
            <h2>{Disk.entity.entity_type === 'ROOT'? "Документы":""}</h2>
        </Col>
    </Row>
    <Row>
        <Col lg={Disk.entity.remindNoteList?.length?8:12}>
            <DragDropFile files = { <FilesContainer /> } callBack= {actionUploadFileCallBack} />
        </Col>
        {Disk.entity.remindNoteList?.length ? 
            <Col lg={4}>
                <DiskRemindList remindNoteList={Disk.entity.remindNoteList}/> 
            </Col>
            : <></>
        }
    </Row>
    </Container>
    );
}


export default Disk;