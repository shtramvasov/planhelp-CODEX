import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Badge, Button, Col, Container, Form, ListGroup, Modal, Row, Stack, Table } from 'react-bootstrap';
import { addUserToProject, delUserToProject, getProject, postTaskStatus, postProjectStatusList } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { getUsers } from "../../../network/UserNetwork";
import { addUserList } from "../../../reducers/User";
import ModalAutoComplete from "../../helpers/ModalAutoComplete";
import TabBar from './TabBar';
import { Navbar } from '../../navbar/Navbar';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useDrag, useDrop } from 'react-dnd';
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

    // после того как перетащили статус на место другого статуса
    const onDragDrop = (dragStatus, dropStatus) => {
        const ordered_project_status_list = [];
        ordered_project_status_list.push(dragStatus);
        ordered_project_status_list.push(dropStatus); 
    
        postProjectStatusList({project_id : project_id, project_status_list : ordered_project_status_list},
            (err) => {
                fetchProject();
            }
        )
    }

    const listStatus = Project.project_status_list.map((el) =>
        <DragStatusCard 
            key={el.status_id} 
            status={el} 
            onEdit={actionCallModalUpdateStatus} 
            onDelete={fetchStatusDelete}
            onDragDrop={onDragDrop}/>
    );

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
            <Container fluid>
            <Row>
                <Col>
                    <Navbar />
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Breadcrumb 
                        items={[
                            {url:`/`, name: "Мои проекты"}, 
                            {url:`/project/${project_id}/list`, name: Project.project_name},
                            {url:``, name: 'Настройка проекта'}
                        ]}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <TabBar />
                    <br/>
                </Col>
            </Row>
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
                    <Table hover>
                    <tbody>
                        {listStatus}
                    </tbody>
                    </Table>
                </Col>
            </Row>
            </Container>
        </>
    )

}

function DragStatusCard(props) {
    // props.status
    // props.onEdit
    // props.onDelete
    // props.onDragDrop

    const el = props.status;
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag(() => ({
      	type: 'STATUSTR',
        item: el,
		collect: (monitor) => ({
        	isDragging: monitor.isDragging()
    	}),
    	end: (item, monitor) => {
            
      		const dropResult = monitor.getDropResult()
			if (item && dropResult) {
                props.onDragDrop(item, dropResult);
			}
    	},
    }))

	const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: "STATUSTR",
        drop: (item, monitor) => { 
            return el;
        },
		hover: (item, monitor) => {
            monitor.isOver({ shallow: true })
        },
        collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
			isOverCurrent: monitor.isOver({ shallow: false }),
		}),
	}));

	
	drop(drag(ref));

    return (
    <tr key = {el.status_id} ref={ref} style={{cursor: "pointer"}}>
        <td>
            <div style={{display:"inline-block", verticalAlign:"top"}}>
            <Button type="button" variant="outline-secondary" style={{ marginRight: '10px' }} onClick={ e => props.onEdit(e, el) }>
                <i className="bi bi-pencil-fill"></i> 
            </Button>
            </div>
            <div style={{display:"inline-block"}}>
            <Badge bg={el.variant}> 
                {el.status_name}
            </Badge>
            <br />
            {  el.is_closed === 'Y' ? <span style={{ fontSize: 'small' }} > Закрывающий статус </span> : "" }
            </div>
        </td>
        <td style={{ textAlign: 'right'}} >
            <Button type="button" variant="outline-danger" onClick={ e => props.onDelete(el.status_id) }> 
                <i className="bi bi-trash3"></i> 
            </Button>
        </td>
    </tr>
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
                                            <Badge key={option} bg={option}>
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