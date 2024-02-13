import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject, getProjectTaskList, postTask } from "../../../network/TaskNetwork";
import { addProject, addTaskList } from '../../../reducers/Project';
import TabBar from "../TabBar";
import Select from 'react-select';
import TaskEditModal from "./TaskEditModal";
import TaskCreateModal from "./TaskCreateModal";
import TaskListMode from "./TaskListMode";
import TaskBoardMode from "./TaskBoardMode";
import moment from 'moment-timezone';
import 'moment/locale/ru';


import queryString from "query-string";
moment.locale('ru');

const noText = "Проект без названия";

function TaskList(props) {

    const [ searchParams ] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, mode } = useParams();
    const [showModalTaskEdit, setShowModalTaskEdit] = useState(false);
    const [showModalTaskCreate, setShowModalTaskCreate] = useState(false);
    const [modalProjectTaskData, setModalProjectTaskData] = useState({project_id: undefined, task_id : undefined});
    
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const executor_id = searchParams.get("executor_id");
    const responsible_id = searchParams.get("responsible_id");
    const reviewer_id = searchParams.get("reviewer_id");
    const status_id = searchParams.get("status_id");
    const tag_id = searchParams.get("tag_id");
    const sprint_id = searchParams.get("sprint_id"); 

    const Project = useSelector((state) => state.project);

    document.title = Project.project.project_name +" | planhelp";

    const onChangeUrl = ({status_id, executor_id, responsible_id, reviewer_id, tag_id, offset, limit}) => {
        
        const currentUrlObj = queryString.parse(document.location.search.slice(1));
        
        if (status_id !== undefined) currentUrlObj.status_id = status_id;
        if (executor_id !== undefined) currentUrlObj.executor_id = executor_id;
        if (responsible_id !== undefined) currentUrlObj.responsible_id = responsible_id;
        if (reviewer_id !== undefined) currentUrlObj.reviewer_id = reviewer_id;
        if (tag_id !== undefined) currentUrlObj.tag_id = tag_id;
        if (limit !== undefined) currentUrlObj.limit = limit;
        if (offset !== undefined) currentUrlObj.offset = offset;

        navigate(`/project/${project_id}/${mode}?${queryString.stringify(currentUrlObj)}`);
        
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
                    task_note : task.task_note,
                    status_id : task.status_id
                    },(err,resp) => {
                if (!err) {
                    // рефрешим список заявок
                    fetchProjectTaskList();
                } else {
                    alert("Ошибка: "+err);
                }
            });
        }
    }

    // достаем задачи с апи
    const fetchProjectTaskList = () => {
        getProjectTaskList({
            limit:limit?limit:"", offset:offset?offset:"",project_id,
            status_id, executor_id, responsible_id, reviewer_id, tag_id, sprint_id,
            sort : mode === "board" ? "orderby_time" : "task_id"
        },(err,resp) => {
            if (!err) {
                dispatch(addTaskList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });
    // мапированный массив тегов проекта
    const tagSelectOptions = Project.project.project_tag_list.map(tag => {
        return {value : tag.tag_id, label : tag.tag}
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
    const tagSelectOptionsDefault = tagSelectOptions.filter(tag => tag.value == tag_id)[0];

    return (
    <Container fluid>

    {/* Модалка редактирования */}
    <TaskEditModal 
        fullscreen={true}
        show={showModalTaskEdit}
        project_id={modalProjectTaskData.project_id}
        task_id={modalProjectTaskData.task_id}
        callBack={actionCallModaTaskEditCallback}
    />
    {/* Модалка создания */}
    <TaskCreateModal 
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
                {url:`/project`, name: "Мои проекты"},
                {url:``, name: Project.project?.project_name.trim()?Project.project.project_name:noText}
            ]}
        />
        </Col>
    </Row>
    <Row>
        <Col>
            <TabBar />
        </Col>
    </Row>
    <Row style={{marginTop : "14px"}}>
        <Col>
        <InputGroup>
            <Button type="button" variant="" onClick={actionCallModaTaskCreate} >
                    <i className="bi bi-plus-circle"></i>
            </Button>
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
            &nbsp;
            <Select 
                // isMulti 
                closeMenuOnSelect={true}
                isClearable
                placeholder="Тэг" 
                value={tagSelectOptionsDefault}
                onChange={(option) => {
                    onChangeUrl({tag_id : option?option.value:null})
                }}
                options={tagSelectOptions}
            />
        </InputGroup>        
        </Col>
    </Row>
    <Row style={{marginTop: "16px"}}>
        <Col lg={12}>
            {mode === "board"? 
                <TaskBoardMode actionCallModaTaskEdit={actionCallModaTaskEdit}/> 
                :
                <TaskListMode actionCallModaTaskEdit={actionCallModaTaskEdit}/> 
            }
        </Col>
    </Row>
    </Container>
    );
}


export default TaskList;