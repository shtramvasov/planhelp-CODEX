import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject, getProjectTaskList, postTask } from "../../network/TaskNetwork";
import { addProject, addTaskList } from '../../reducers/Project';
import Select from 'react-select';
import ModalTaskEdit from "./ModalTaskEdit";
import ModalTaskCreate from "./ModalTaskCreate";
import moment from 'moment-timezone';
import 'moment/locale/ru';
import queryString from "query-string";
moment.locale('ru');

function TaskProjectList(props) {

    const [ searchParams ] = useSearchParams();
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const executor_id = searchParams.get("executor_id");
    const responsible_id = searchParams.get("responsible_id");
    const reviewer_id = searchParams.get("reviewer_id");
    const status_id = searchParams.get("status_id");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id } = useParams();

    const [showModalTaskEdit, setShowModalTaskEdit] = useState(false);
    const [showModalTaskCreate, setShowModalTaskCreate] = useState(false);
    const [modalProjectTaskData, setModalProjectTaskData] = useState({project_id: undefined, task_id : undefined});

    const Project = useSelector((state) => state.project);

    document.title = Project.project.project_name +" | planhelp";
    
    // Первичная загрузка данных
    useEffect(() => {
        // загрузка данных о проекте
        fetchProject();
    },[]);

    useEffect(() => {
        // загрузка данных о задачах
        fetchProjectTaskList();
    },[offset, executor_id, status_id, responsible_id, reviewer_id])

    const onChangeUrl = ({status_id, executor_id, responsible_id, reviewer_id, offset, limit}) => {

        const currentUrlObj = queryString.parse(document.location.search.slice(1));
        
        if (status_id !== undefined) currentUrlObj.status_id = status_id;
        if (executor_id !== undefined) currentUrlObj.executor_id = executor_id;
        if (responsible_id !== undefined) currentUrlObj.responsible_id = responsible_id;
        if (reviewer_id !== undefined) currentUrlObj.reviewer_id = reviewer_id;
        if (limit !== undefined) currentUrlObj.limit = limit;
        if (offset !== undefined) currentUrlObj.offset = offset;

        navigate(`/task/project/${project_id}?${queryString.stringify(currentUrlObj)}`);
        
    }

    // вызов модалки редактирования задачи
    const actionCallModaTaskEdit = (e, {project_id, task_id}) => {
        e.preventDefault();
        setModalProjectTaskData({project_id:project_id, task_id:task_id});
        // dispatch(addEntityNote({}));
        setShowModalTaskEdit(true);
    }

    // вызов модалки создания новой задачи
    const actionCallModaTaskCreate = (e) => {
        e.preventDefault();
        // dispatch(addEntityNote({}));
        setShowModalTaskCreate(true);
    }

    // колбэк после редактирования задачи
    const actionCallModaTaskEditCallback = (commonNote) => {
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        setShowModalTaskEdit(false);
    }

    // колбэк после создания новой задачи
    const actionCallModaTaskCreateCallback = (task) => {
        setShowModalTaskCreate(false);
        if (task) {
            postTask({
                    project_id : project_id, 
                    task_title : task.task_title, 
                    task_note : task.task_note},(err,resp) => {
                if (!err) {
                    // рефрешим список заявок
                    fetchProjectTaskList();
                } else {
                    alert("Ошибка: "+err);
                }
            });
        }
    }

    // достаем проект с апи
    const fetchProject = () => {
        getProject({project_id},(err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // достаем задачи с апи
    const fetchProjectTaskList = () => {
        getProjectTaskList({
            limit:limit?limit:"", offset:offset?offset:"",project_id,
            status_id, executor_id, responsible_id, reviewer_id
        },(err,resp) => {
            if (!err) {
                dispatch(addTaskList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const paginateForward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset?offset:0)+50});
        // navigate(`/task/project/${project_id}?limit=50&offset=${parseInt(offset?offset:0)+50}`);
    }
    const paginateBackward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset)-50});
        // navigate(`/task/project/${project_id}?limit=50&offset=${parseInt(offset)-50}`);
    }

    // Список задачи
    const listItems = Project.taskList.map((el,index) => 
        <ListGroup.Item key={index} 
            action active={false} href={`/task/project/${el.project_id}/${el.task_id}/`} 
            onClick={(e) => {actionCallModaTaskEdit(e, {project_id : el.project_id, task_id : el.task_id})}} 
            variant={el.is_closed === "Y"? "secondary":""}>
                <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{el.task_title}</h5>
                    <small>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
                </div>
                <p className="mb-1">
                    {el.executor_id?<><i className="bi bi-person"></i> {el.ru_executor_login} &nbsp;</> :""}
                    {el.ru_responsible_id?<><i className="bi bi-person-check"></i> {el.ru_responsible_login} &nbsp;</> :""}
                    {el.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {el.ru_reviewer_login} &nbsp;</> :""}
                </p>
                <small><Badge bg={el.status_id?el.variant:"secondary"}>{el.status_id?el.status_name:"Без статуса"}</Badge></small>
        </ListGroup.Item>
    )

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });
    // дефолтное значение статуса
    const statusSelectOptionsDefault = statusSelectOptions.filter(status => status.value == status_id)[0];
    // мапированный массив пользователей
    const userSelectOptions = Project.project.project_user_list.map(user => {
        return {value : user.user_id, label : user.login}
    });
    const executorSelectOptionsDefault = userSelectOptions.filter(user => user.value == executor_id)[0];
    const responsibleSelectOptionsDefault = userSelectOptions.filter(user => user.value == responsible_id)[0];
    const reviewerSelectOptionsDefault = userSelectOptions.filter(user => user.value == reviewer_id)[0];
    
    return (
    <Container>

    {/* Модалка редактирования */}
    <ModalTaskEdit 
        fullscreen={true}
        show={showModalTaskEdit}
        project_id={modalProjectTaskData.project_id}
        task_id={modalProjectTaskData.task_id}
        callBack={actionCallModaTaskEditCallback}
    />
    {/* Модалка создания */}
    <ModalTaskCreate 
        fullscreen={true}
        show={showModalTaskCreate} 
        callBack={actionCallModaTaskCreateCallback}
    />

    <Row>
        <Col>
            <Navbar />
            <hr/>
        </Col>
    </Row>
    <Row>
        <Col>
        <Breadcrumb 
            items={[
                {url:`/task`, name: "Мои проекты"},
                {url:``, name: Project.project.project_name}
            ]}
        />
        </Col>
    </Row>

    <Row>
        <Col>
            <div style={{float:"left",paddingRight:"4px"}}>
            <h2>{Project.project.project_name}</h2>
            </div>
            <div>
            <Form.Group className="mb-3">
                <Button type="button" variant="" onClick={actionCallModaTaskCreate} >
                    <i className="bi bi-plus-circle"></i>
                </Button>
            </Form.Group>
            </div>
        </Col>
    </Row>
    <Row>
        <Col>
        <InputGroup>
            <Select 
                // isMulti 
                closeMenuOnSelect={true} 
                isClearable
                onChange={(option) => {
                    onChangeUrl({status_id : option?option.value:null})
                }}
                value={statusSelectOptionsDefault}
                placeholder="Статус" 
                options={statusSelectOptions}
            />
            &nbsp;
            <Select 
                // isMulti 
                closeMenuOnSelect={true} 
                isClearable
                placeholder="Исполнитель" 
                value={executorSelectOptionsDefault}
                onChange={(option) => {
                    onChangeUrl({executor_id : option?option.value:null})
                }}
                options={userSelectOptions}
            />
            &nbsp;
            <Select 
                // isMulti 
                closeMenuOnSelect={true}
                isClearable
                placeholder="Ответственный"
                value={responsibleSelectOptionsDefault}
                onChange={(option) => {
                    onChangeUrl({responsible_id : option?option.value:null})
                }}
                options={userSelectOptions}
            />
            &nbsp;
            <Select 
                // isMulti 
                closeMenuOnSelect={true}
                isClearable
                placeholder="Ревьювер" 
                value={reviewerSelectOptionsDefault}
                onChange={(option) => {
                    onChangeUrl({reviewer_id : option?option.value:null})
                }}
                options={userSelectOptions}
            />
        </InputGroup>        
        </Col>
    </Row>
    <Row style={{marginTop: "16px"}}>
        <Col lg={12}>
            <ListGroup>
                {listItems}
            </ListGroup>      
        </Col>
    </Row>
    <Row style={{marginBottom: "32px"}}>
        <Col>
        <br/><br/>
            {offset!=0?
            <a href="#" onClick={paginateBackward} style={{fontSize:"1.6em"}}>
                <i className="bi bi-arrow-left-circle"></i>
            </a>:""
            }
            &nbsp;
            <a href="#" onClick={paginateForward} style={{fontSize:"1.6em"}}>
                <i className="bi bi-arrow-right-circle"></i>
            </a>
        </Col>
    </Row>
    </Container>
    );
}


export default TaskProjectList;