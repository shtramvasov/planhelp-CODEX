import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ModalOneInputText from "../helpers/ModalOneInputText";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import ListGroup from 'react-bootstrap/ListGroup';
import { addEntity } from '../../reducers/Disk'
import { useNavigate , useSearchParams} from "react-router-dom";
import { getDiskEntity, postDiskEntity, deletetDiskEntity } from '../../network/DiskNetwork';
import { useParams } from 'react-router-dom';

function Disk(props) {
    
    const { entity_id } = useParams();
    const [ searchParams ] = useSearchParams();
    const dispatch = useDispatch()
    const Disk = useSelector((state) => state.disk);
    const navigate = useNavigate();

    const [showModalCreatePath, setShowModalCreatePath] = useState(false);
    const [showModalCreateFile, setShowModalCreateFile] = useState(false);
    
    const fetchEntity = () => {
        getDiskEntity({entity_id : entity_id, search : searchParams.get("search")},(err,resp) => {
            if (!err) {
                dispatch(addEntity(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

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
     
    const listItems = Disk.entity.childEntityList ? Disk.entity.childEntityList.map((el) =>
    // onClick={(e) => {handleClick(el.entity_type,el.entity_id)}} 
        <ListGroup.Item key={el.entity_id} 
            action href={el.entity_type ==="PATH"?`/disk/${el.entity_id}`:`/disk/${el.entity_id}/file/read`}
            onClick={(e) => {handleClick(e,el.entity_type,el.entity_id)}} 
            variant={el.entity_type === "PATH"?"success":""}
            >
            {el.type === "PATH" ? <strong>{el.entity_name}</strong> : <small>{el.entity_name}</small>}    
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
    <Row>
        <Col>
            <Navbar />
            <hr/>
        </Col>
    </Row>
    <Row>
        <Col>
            <form onSubmit={actionFindSubmit}>
                <Form.Group className="mb-3" controlId="formFindText">
                    <Form.Control type="text" placeholder="Поиск" defaultValue={searchParams.get("search")}/>
                </Form.Group>
            </form>
        </Col>
    </Row>
    <Row>
        <Col xs={1}>
            <div>
                <Button variant="primary" onClick={actionCallModalNewPath}>Папка+</Button>
            </div>
            <div>
                <Button style={{marginTop : "2px"}} variant="primary" onClick={actionCallModalNewFile}>Файл+</Button>
            </div>
        </Col>
        <Col>
        <ListGroup >{listItems}</ListGroup>
        </Col>
        {entity_id?
        <Col xs={2}>
            <div style={{marginTop : "2px"}}>
                <Button type="button" variant="warning" onClick={deleteEntity}>Удалить</Button>
            </div>
        </Col>:""}
    </Row>
    </Container>
    );
}


export default Disk;