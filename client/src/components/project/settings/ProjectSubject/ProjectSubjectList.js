import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row, Table, Badge } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';

import { getProject } from '../../../../network/TaskNetwork';
import { postProjectSubject, postProjectSubjectOrderbyTime } from '../../../../network/ProjectSubject';
import { addProject, addProjectSubject } from '../../../../reducers/Project';
import TabBar from '../TabBar';
import { Navbar } from '../../../navbar/Navbar';
import Breadcrumb from "../../../helpers/Breadcrumb";
import { addPositiveMessage, addNegativeMessage } from '../../../../reducers/App';
import ProjectSubjectModalForm from "./ProjectSubjectModalForm";
import { messages } from "../../../constants/Msg";

import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function ProjectSubjectList(props) {

    const componentName = 'Сущности';
    const dispatch = useDispatch();

    const User = useSelector((state) => state.user);
    const Project = useSelector((state) => state.project.project);
    const project_subject = useSelector((state) => state.project.project_subject);
    console.log(project_subject);
    const { project_id } = useParams();
    
    // Модалка для добавления/изменения тематики в проект
    const [showModalProjectSubject, setShowModalProjectSubject] = useState(false);
    
    // const [editSubjectName, setEditSubjectName] = useState("");
    // const [editSubjectId, setEditSubjectId] = useState(null);

    // Первичная загрузка данных
    useEffect(() => { fetchProject()},[]);

    /// Детали проекта
    const fetchProject = () => {
        getProject({project_id}, (err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                dispatch(addNegativeMessage("Ошибка загрузки проекта"));
            }
        });
    };

    const fetchDeleteProjectSubject = (subject_id) => {
        postProjectSubject({project_id, subject_id, is_deleted : "Y"}, (err,resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchProject();
            } else {
                dispatch(addNegativeMessage(messages.SAVE_FAIL));
            }
        });
    }

    // после того как перетащили статус на место другого статуса
    const onDragDrop = (dragStatus, dropStatus) => {
        const ordered_project_subject_list = [];
        ordered_project_subject_list.push(dragStatus);
        ordered_project_subject_list.push(dropStatus);

        postProjectSubjectOrderbyTime({project_id : project_id, project_subject_list : ordered_project_subject_list},
            (err) => {
                if (!err) {
                    dispatch(addPositiveMessage(messages.SUCCESS));
                    fetchProject();
                } else {
                    dispatch(addNegativeMessage(messages.SAVE_FAIL));
                }
            }
        )
    }

    // Вызов модалки для добавления сущности
    const actionCallModalCreateProjectSubject = (e) => {
        e.preventDefault();
        dispatch(addProjectSubject({}));
        setShowModalProjectSubject(true);
    }

    const actionCallModalUpdateProjectSubject = (e, el) => {
        e.preventDefault();
        dispatch(addProjectSubject(el));
        setShowModalProjectSubject(true);
    }

    const actionCallBackModalCreateProjectSubject = (isSave) => {
        
        // e.preventDefault();
        setShowModalProjectSubject(false);
        if (!isSave) { return; }
        // dispatch(addPositiveMessage(subject_name));
        // fetchTagCreate(newTag);
        postProjectSubject({
            project_id, 
            subject_name : project_subject.subject_name, 
            subject_type : project_subject.subject_type,
            subject_id : project_subject.subject_id,
            display_variant : project_subject.display_variant
            }, (err,resp) => {
            // setEditSubjectId(null);
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchProject();
            } else {
                dispatch(addNegativeMessage(messages.SAVE_FAIL));
            }
        });
    }

    function DragProjectSubjectCard(props) {
        // props.projectSubject{
        //     "subject_id": 13,
        //     "project_id": 23,
        //     "subject_name": "Сторис",
        //     "is_deleted": "N",
        //     "orderby_time": 1739376498
        // }
    
        const el = props.projectSubject;
        const ref = useRef(null);
    
        const [{ isDragging }, drag] = useDrag(() => ({
              type: 'SUBJECTTR',
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
            accept: "SUBJECTTR",
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
        <tr key = {el.subject_id} ref={ref} style={{cursor: "pointer"}}>
            <td>
                <div style={{display:"inline-block"}}>
                <Button type="button" variant="outline-secondary" style={{ marginRight: '10px' }} onClick={ e => props.onEdit(e, el) }>
                    <i className="bi bi-pencil-fill"></i> 
                </Button>
                </div>
                <div style={{display:"inline-block"}}>
                <Badge bg="primary"> 
                    {el.subject_type === "LOV" ? "Список" : "Текст"}
                </Badge>
                </div>
                &nbsp;
                <div style={{display:"inline-block"}}>
                    {el.subject_name}
                </div>
            </td>
            <td>
                {el.display_variant === 0? <Badge bg="danger">Видят все пользователи проекта</Badge>: <Badge bg="success">Видят только владельцы проекта</Badge>}
            </td>
            <td style={{ textAlign: 'right'}} >
                <Button type="button" variant="outline-danger" onClick={ e => props.onDelete(el.subject_id) }> 
                    <i className="bi bi-trash3"></i> 
                </Button>
            </td>
        </tr>
        )
    }

    const projectSubjectList = Project.project_subject_list.map((el) =>
        <DragProjectSubjectCard 
            key={el.subject_id} 
            projectSubject={el} 
            onEdit={actionCallModalUpdateProjectSubject} 
            onDelete={fetchDeleteProjectSubject}
            onDragDrop={onDragDrop}/>
    );
    
    return(
        <>
            <ProjectSubjectModalForm 
                show={showModalProjectSubject} 
                callBack={actionCallBackModalCreateProjectSubject} />
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
                            {url:``, name: componentName}
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
                        <h3> {componentName} </h3>
                    </div>
                    <div>
                        <Form.Group className="mb-3">
                            <Button type="button" variant="" onClick={ actionCallModalCreateProjectSubject } >
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
                        {projectSubjectList}
                    </tbody>
                    </Table>
                </Col>
            </Row>
            </Container>
        </>
    )    
}

export default ProjectSubjectList;
