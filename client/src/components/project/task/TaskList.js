import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup, Collapse } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    const [showFilters, setshowFilters] = useState(false);
    const [showModalTaskEdit, setShowModalTaskEdit] = useState(false);
    const [showModalTaskCreate, setShowModalTaskCreate] = useState(false);
    const [modalProjectTaskData, setModalProjectTaskData] = useState({project_id: undefined, task_id : undefined});
    const [filterCount, setFilterCount] = useState(0);

    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const executor_id = searchParams.get("executor_id");
    const responsible_id = searchParams.get("responsible_id");
    const reviewer_id = searchParams.get("reviewer_id");
    const status_id = searchParams.get("status_id");
    const tag_id = searchParams.get("tag_id");
    const date_start = searchParams.get("date_start"); 
    const date_end = searchParams.get("date_end"); 
    const search = searchParams.get("search"); 
    const open_modal_task_id = searchParams.get("open_modal_task_id"); 

    // Первичная загрузка данных
    useEffect(() => {
        // загрузка данных о проекте
        setFilterCount(
            Object.values(
                // queryString.parse(document.location.search.slice(1))
                // для подсчета кол-ва фильтров исключаем limit / offset 
                {...queryString.parse(document.location.search.slice(1)), limit:'', offset:'', open_modal_task_id:''}
            ).filter((el) => !!el).length
        );
    },[document.location.search]);

    useEffect(() => {
        if (open_modal_task_id) {
            setModalProjectTaskData({project_id:project_id, task_id:open_modal_task_id});
            setShowModalTaskEdit(true);
        } else {
            setShowModalTaskEdit(false);
        }
    },[open_modal_task_id])

    const Project = useSelector((state) => state.project);

    const addDays = (date, days) => {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    const onChangeUrl = ({status_id, executor_id, responsible_id, reviewer_id, tag_id, offset, limit, date_start, date_end, search, open_modal_task_id}) => {
        const currentUrlObj = queryString.parse(document.location.search.slice(1));
        
        if (status_id !== undefined) currentUrlObj.status_id = status_id;
        if (executor_id !== undefined) currentUrlObj.executor_id = executor_id;
        if (responsible_id !== undefined) currentUrlObj.responsible_id = responsible_id;
        if (reviewer_id !== undefined) currentUrlObj.reviewer_id = reviewer_id;
        if (tag_id !== undefined) currentUrlObj.tag_id = tag_id;
        if (limit !== undefined) currentUrlObj.limit = limit;
        if (offset !== undefined) currentUrlObj.offset = offset;
        if (date_start !== undefined) currentUrlObj.date_start = date_start;
        if (date_end !== undefined) currentUrlObj.date_end = date_end;
        if (search !== undefined) currentUrlObj.search = search;
        if (open_modal_task_id !== undefined) currentUrlObj.open_modal_task_id = open_modal_task_id;
        currentUrlObj.note_id = undefined;
        navigate(`/project/${project_id}/${mode}?${queryString.stringify(currentUrlObj)}`);
        
    }

    // вызов модалки редактирования задачи
    const actionCallModaTaskEdit = (e, {project_id, task_id}) => {
        e.preventDefault();
        onChangeUrl({open_modal_task_id : task_id});
        // dispatch(addEntityNote({}));
        // setShowModalTaskEdit(true);
    }

    // вызов модалки создания новой задачи
    const actionCallModaTaskCreate = (e) => {
        e.preventDefault();
        // dispatch(addEntityNote({}));
        setShowModalTaskCreate(true);
    }

    // вызов фильров
    const actionCallFilter = (e) => {
        e.preventDefault();
        setshowFilters(!showFilters);
    }

    // колбэк после редактирования задачи
    const actionCallModaTaskEditCallback = (commonNote) => {
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        // setShowModalTaskEdit(false);
        onChangeUrl({open_modal_task_id : ""});
    }

    // submit find search text
    const actionFindSubmit = (e) => {
        e.preventDefault();
        onChangeUrl({search : e.target.formFindText.value});
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
            status_id, executor_id, responsible_id, reviewer_id, tag_id,
            date_start, date_end, search, 
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
            <Button type="button" variant="" onClick={actionCallFilter} >
                <i className="bi bi-filter"></i>
                <span className="position-absolute top-0 start-55 translate-right badge rounded-pill bg-danger">
                    {filterCount?filterCount:""}
                </span>
            </Button>
        </InputGroup>        
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col>
        <Collapse in={showFilters}>
            <div>
            <Row>
                <Col md={12}>
                <form onSubmit={actionFindSubmit}>
                    <Form.Group controlId="formFindText" className="mb-3">
                        <Form.Control type="text" 
                            placeholder='Поиск по заголовкам, например "детали оповещения"'
                            defaultValue={searchParams.get("search")}
                        />
                    </Form.Group>
                </form>
                </Col>
            </Row>
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={3}>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <InputGroup>
                    <Form.Group className="mb-3">
                        <DatePicker 
                            wrapperClassName="datePicker phDatePicker" 
                            placeholderText="ДД.ММ.ГГГГ"
                            selected={Date.parse(date_start)}
                            onChange={(date) => { onChangeUrl({date_start : date ? date.toISOString():""}) }}
                            dateFormat="d.MM.yyyy"/>
                    </Form.Group>
                    <div style={{paddingTop: "6px",paddingBottom: "6px"}}>&nbsp;&mdash;&nbsp;</div>
                    <Form.Group className="mb-3">
                        <DatePicker 
                            wrapperClassName="datePicker phDatePicker" 
                            placeholderText="ДД.ММ.ГГГГ"
                            selected={date_end ? addDays(Date.parse(date_end),-1): null}
                            onChange={(date) => { onChangeUrl({date_end : date ? addDays(date,1).toISOString():""}) }}
                            dateFormat="d.MM.yyyy"/>
                    </Form.Group>
                    </InputGroup>
                </Col>
            </Row>
            </div>
        </Collapse>
        </Col>
    </Row>
    <Row>
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