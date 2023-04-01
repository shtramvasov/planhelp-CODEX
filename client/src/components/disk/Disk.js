import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalInputFile from "../helpers/ModalInputFile";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addEntity, addEntityFiles, addLastUploadFile } from '../../reducers/Disk'
import { useNavigate , useSearchParams} from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity } from '../../network/DiskNetwork';
import { postEntityNote } from '../../network/NoteNetwork';
import { useParams } from 'react-router-dom';
import ToastMessage from "../helpers/ToastMessage";

function Disk(props) {
    
    const { entity_id, mode } = useParams();
    const [ searchParams ] = useSearchParams();

    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

    const [showModalCreatePath, setShowModalCreatePath] = useState(false);
    const [showModalCreateFile, setShowModalCreateFile] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);
    const [showToastSuccessUploadFile, setToastSuccessUploadFile] = useState(false);
    const didCloseToast = () => setToastSuccessUploadFile(false);
    
    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id, search : searchParams.get("search")},(err,resp) => {
            if (!err) {
                if (resp.entity_type==="FILE") {
                    console.log("its file");
                    navigate(`/disk/${entity_id}/file/read`);
                }
                dispatch(addEntity(resp));
                // fetchFiles();
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // const fetchFiles = () => {
    //     getFilesList(entity_id, (err, resp) => {
    //         if (!err && !resp.error) {
    //             dispatch(addEntityFiles(resp))
    //         }
    //     })
    // }
 
    document.title = Disk.entity.entity_type !=='ROOT'? Disk.entity.entity_name+" | planhelp":"Диск | planhelp";
    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchEntity();
    },[entity_id,searchParams.get("search")]);

    // Поиск по диску, вызывается по enter на поле поиска
    const actionFindSubmit = (e) => {
        e.preventDefault();
        navigate(`/disk?search=${e.target.formFindText.value}`);
        //fetchEntity();
    }

    // Вызов модалки создания папки
    const actionCallModalNewPath = (e) => {
        console.log("newPath");
        e.preventDefault();
        setShowModalCreatePath(true);
    }

    // Вызов модалки создания файла
    const actionCallModalNewFile = (e) => {
        console.log("newFile");
        e.preventDefault();
        setShowModalCreateFile(true);
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
    
    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
        if (!file) {
            return;
        }
        // fetchFiles();
        setToastSuccessUploadFile(true);
        setTimeout(didCloseToast, 5000);
        // dispatch(addLastUploadFile(file));
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
                            
                        } else {
                            alert("Ошибка: "+err);
                        }
                    });

                }
            }
        );
    }

    // Колбек с инфо.сообщение о том что файл загрузили
    const actionSuccessUploadFileCallBack = () => {
        // didCloseToast()
    }

    const deleteEntity = () => {
        deletetDiskEntity({entity_id}, (err,data) => {
            if (!err) navigate(`/disk/${Disk.entity.parent_entity_id?Disk.entity.parent_entity_id:""}`);
        })
    }

    // Обработка клика по entity
    const handleClick = (e,entity_type,entity_id) => {
        e.preventDefault();
        if (entity_type === 'PATH') {
            navigate(`/disk/${entity_id?entity_id:""}`);
        } else {
            navigate(`/disk/${entity_id?entity_id+"/file/read":""}`);
        }
    }
     
    const handleEditEntity = () => {
        navigate(`/disk/${entity_id}/path/edit`);
    }

    const handleInfoEntity = () => {
        navigate(`/disk/${entity_id}/activity`);
    }

    // const handleDownloadFile = (e) => {
    //     const hash_name = e.hash_name
    //     const original_name = e.original_name
    //     downloadFile(hash_name, original_name)
    // }

    // var listFiles;
    /// Ячейки таблицы с файлами
    // if (Disk.entity.entity_type !=='ROOT') {
    //     const url = `http://localhost:3001/api/files/${entity_id}`
    //     listFiles = Disk.entityFiles ? Disk.entityFiles.map((file) => {
    //         return  <ListGroup.Item key={file.id} variant="info" action onClick={(e) => { handleDownloadFile(file) }} > 
    //                     { file.original_name } 
    //                 </ListGroup.Item>
    //     }) : [];
    // }


    var listItems = Disk.entity.childEntityList ? Disk.entity.childEntityList.map((el) =>
    // onClick={(e) => {handleClick(el.entity_type,el.entity_id)}} 
        <ListGroup.Item key={el.entity_id} 
            action href={el.entity_type ==="PATH"?`/disk/${el.entity_id}`:`/disk/${el.entity_id}/file/read`}
            onClick={(e) => {handleClick(e,el.entity_type,el.entity_id)}} 
            variant={el.entity_type === "PATH"?"success":""}
            >
            {
                el.user_role !== "OWNER"?<i className="bi bi-share"> </i>:
                el.entity_type === "PATH"
                ?<i className="bi bi-folder2"> </i>:
                <i className="bi bi-file-earmark-text"> </i>
            }
            {el.entity_name}
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

    return (
        
    <Container>
        <ModalOneInputText title={"Новая папка"} show={showModalCreatePath} callBack={actionNewPathCallBack} />
        <ModalOneInputText title={"Новый файл"} show={showModalCreateFile} callBack={actionNewFileCallBack} />
        <ModalInputFile title={"Загрузить файл"} show={showModalUploadFile} callBack= {actionUploadFileCallBack}  />
    <Row>
        <Col>
            <Navbar />
            <hr/>
        </Col>
    </Row>
    <Row>
        <Col>
            <form onSubmit={actionFindSubmit}>
                <Form.Group controlId="formFindText" style={{marginBottom:"8px"}}>
                    <Form.Control type="text" placeholder="Поиск" defaultValue={searchParams.get("search")}/>
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
    <Row style={{marginBottom:"8px"}}>
        <Col>
            <Form.Group controlId="formFindText">
                <Button variant="outline-primary" onClick={actionCallModalNewPath}>
                    <i className="bi bi-folder-plus"></i>
                </Button>
                <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalNewFile}>
                    <i className="bi bi-file-earmark-plus"></i>
                </Button>
                <Button style={{marginLeft : "2px"}} variant="outline-primary" onClick={actionCallModalUploadFile}>
                    <i className="bi bi-cloud-arrow-up"></i> 
                </Button>
                {entity_id ?
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleEditEntity}>Изменить папку</Button>
                :""}
                {
                Disk.entity.entity_type === "ROOT"?"":
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleInfoEntity}><i className="bi bi-info-circle"></i></Button>
                }
            </Form.Group>
        </Col>
    </Row>
    <Row>
        <Col>
            <h2>{Disk.entity.entity_type === 'PATH'? Disk.entity.entity_name:""}</h2>
        </Col>
    </Row>
    <Row>
        <Col>
            <ListGroup> {listItems} </ListGroup>
        </Col>
    </Row>
    <br />
    {/* <Row>
        <Col>
            <ListGroup> {listFiles} </ListGroup>
        </Col>
    </Row> */}

    {
        // Инфо сообщение, о том что файл загрузили
        showToastSuccessUploadFile ?  <ToastMessage file ={ Disk.lastUploadFile } callBack = { actionSuccessUploadFileCallBack } /> : ""
    }

    </Container>
    );
}


export default Disk;