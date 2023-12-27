import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Badge, Button, Col, Container, Form, ListGroup, Modal, Row, Stack, Table } from 'react-bootstrap';
import { addUserToProject, delUserToProject, getProject, postTaskStatus } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { getUsers } from "../../../network/UserNetwork";
import { addUserList } from "../../../reducers/User";
import ModalAutoComplete from "../../helpers/ModalAutoComplete";
moment.locale('ru');

function ProjectStatus(props) {
    
    const dispatch = useDispatch();

    const Project = useSelector((state) => state.project.project);
    const { project_id } = useParams();

    const [selectedStatus, setSelectedStatus] = useState(null);

    const placeholerNewStatus = {
        status_name: 'Новый статус',
        variant: 'primary',
        is_closed: 'N',
    };
    
    // Модалка для изменения статуса
    const [showModalUpdateStatus, setShowModalUpdateStatus] = useState(false);

    // Модалка для создания статуса
    const [showModalCreateStatus, setShowModalCreateStatus] = useState(false);

    // Первичная загрузка данных
    useEffect(() => { fetchProject()},[]);

    /// Детали проекта
    const fetchProject = () => {
        getProject({project_id}, (err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    /// Обнолвяем статус
    const fetchStatusUpdate = (status) => {
        postTaskStatus({ project_id: project_id, 
                         name: status.status_name,
                         variant: status.variant,
                         is_closed: status.is_closed,
                         status_id: status.status_id,
                         is_deleted: 'N'
                        }, (err, resp) => {
                            if (!err) {
                                fetchProject()
                            } else {
                                alert("Ошибка: " + err);
                            }
                        })
    };
    
    /// Создать статус
    const fetchStatusCreate = (status) => {
        postTaskStatus({ project_id: project_id, 
            name: status.status_name,
            variant: status.variant,
            is_closed: status.is_closed,
            is_deleted: 'N'
           }, (err, resp) => {
               if (!err) {
                   fetchProject()
               } else {
                   alert("Ошибка: " + err);
               }
           })
    };

    const fetchStatusDelete = (statusId) => {
        postTaskStatus({ project_id: project_id, 
                         is_deleted: 'Y', 
                         status_id: statusId }, (err, resp) => {
                            if (!err) {
                                fetchProject()
                            } else {
                                alert("Ошибка: " + err);
                            }
                         })
    }

    // Вызов модалки, для обновления стутуса
    const actionCallModalUpdateStatus = (e, status) => {
        e.preventDefault();
        setSelectedStatus(status);
        setShowModalUpdateStatus(true);
    }

    const actionCallBackModalUpdateStatus = (updateStatus) => {
        setShowModalUpdateStatus(false);
        if (!updateStatus) { return; }
        fetchStatusUpdate(updateStatus);
    }

    // Вызов модалки, для создания стутуса
    const actionCallModalCreateStatus = (e) => {
        e.preventDefault();
        setShowModalCreateStatus(true);
    }

    const actionCallBackModalCreateStatus = (newStatus) => {
        setShowModalCreateStatus(false);
        if (!newStatus) { return; }
        fetchStatusCreate(newStatus);
    }

    const listStatus = Project.project_status_list.map((el) =>
        <tr key = {el.status_id}>
            <td>
                <Badge bg={el.variant}> 
                    {el.status_name}
                </Badge>
                <br />
                {  el.is_closed === 'Y' ? <span style={{ fontSize: 'small' }} > Закрывающий статус </span> : "" }
            </td>
            <td style={{ textAlign: 'right'}} >
                <Button type="button" variant="outline-secondary" style={{ marginRight: '10px' }} onClick={ e => actionCallModalUpdateStatus(e, el) }>
                    <i className="bi bi-pencil-fill"></i> 
                </Button>
                <Button type="button" variant="outline-danger" onClick={ e => fetchStatusDelete(el.status_id) }> 
                    <i className="bi bi-trash3"></i> 
                </Button>
            </td>
        </tr>
    );

    const AccessTable = () => {
        return (
            <>
            <Table>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {listStatus}
                </tbody>
            </Table>
            </>
        )
    };

    return(
        <>
            <ModalStatus 
                title = { "Изменить статус" }
                show = { showModalUpdateStatus }
                status = { selectedStatus }
                callBack = { actionCallBackModalUpdateStatus }
            />
            <ModalStatus 
                title = { "Новый статус" }
                show = { showModalCreateStatus }
                status = { placeholerNewStatus }
                callBack = { actionCallBackModalCreateStatus }
            />
            <Row>
                <Col>
                    <div style={{float:"left", paddingRight:"4px"}}>
                        <h3> Настройки статусов </h3>
                    </div>
                    <div>
                        <Form.Group className="mb-3">
                            <Button type="button" variant="" onClick={ actionCallModalCreateStatus } >
                                <i className="bi bi-plus-circle" />
                            </Button>
                        </Form.Group>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <AccessTable />
                </Col>
            </Row>
        </>
    )

}

// Модалка для создания/редактирования стутаусов
function ModalStatus(props) {
    
    const options = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedName, setSelectedName] = useState(null);
    const [isClosed, setIsClosed] = useState('N');


    useEffect(() => { 
        if (props.status) {
            setSelectedOption(props.status.variant)
            setSelectedName(props.status.status_name)
            setIsClosed(props.status.is_closed)
        }
    }, [props.status]);

    const didCloseTap = () => {
        props.callBack();
    }

    const didSaveTap = (e) => {
        e.preventDefault();
        const status = {
            status_id:  props.status.status_id,
            status_name: selectedName,
            variant: selectedOption,
            is_closed: isClosed,
        }
        props.callBack(status);
    }

    const didSelectedOptionCheckbox = (variant) => {
        setSelectedOption(variant)
    }

    const didSelectedIsClosedCheckbox = () => {
        (isClosed === 'Y') ? setIsClosed('N') : setIsClosed('Y')
    }

    const didChangeName = (name) => {
        setSelectedName(name)
    }
    
    return (
        <Modal show={props.show} onHide={didCloseTap}>
            <Container>
            <Row>
                <Col>
                <form onSubmit={didSaveTap}>
                    <Modal.Header closeButton={true}>
                            <Modal.Title> { props.title } </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Row style={{ backgroundColor: 'rgb(246, 248, 250)', borderRadius: '10px', marginBottom: '15px', textAlign: 'center' }} >
                            <Col>
                                <Badge style={{ margin: '5px' }} bg={ selectedOption }> 
                                    { selectedName }
                                </Badge>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label> Название статуса </Form.Label>
                                    <Form.Control type="text" value={ selectedName } onChange={ e => didChangeName(e.target.value) } />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Цвет</Form.Label>
                                    <Stack direction='horizontal' gap={ 2 }>
                                        { options.map((option) => (
                                            <Badge bg={option}>
                                                <Form.Check checked = { option === selectedOption } onChange={ () => didSelectedOptionCheckbox(option) } />
                                            </Badge>
                                        ))}
                                    </Stack>
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col>
                                {/* Тут не так просто controlId а для того чтобы работал нативный клик по label */}
                                <Form.Group className="mb-3" controlId="formClosedCheckbox">
                                    <Form.Check 
                                        type="checkbox"
                                        label="Является ли статус закрывающим задачи ?" 
                                        inline 
                                        checked = { isClosed === 'Y' } 
                                        onChange={ didSelectedIsClosedCheckbox } 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
        
                    </Modal.Body>
                    
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={didCloseTap}>
                            Закрыть
                        </Button>
                        <Button variant="outline-primary" type="submit">
                            Сохранить
                        </Button>
                    </Modal.Footer>
                </form>
                </Col>
            </Row>
            </Container>
        </Modal>
        );
}

export default ProjectStatus;