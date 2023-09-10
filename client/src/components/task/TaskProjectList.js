import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { addUserToProject, getProject, getProjectTaskList } from "../../network/TaskNetwork";
import { addProject, addTaskList } from '../../reducers/Project';
import Select from 'react-select';
import ModalTask from "./ModalTask";
import moment from 'moment-timezone';
import 'moment/locale/ru';


moment.locale('ru');

function TaskProjectList(props) {
    const [ searchParams ] = useSearchParams();
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;

    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, task_id } = useParams();

    const [showModalTaskDetail, setShowModalTaskDetail] = useState(false);
    const Project = useSelector((state) => state.project);

    // Первичная загрузка данных
    useEffect(() => {
        fetchProject();
    },[]);

    useEffect(() => {
        fetchProjectTaskList();
    },[offset])

    useEffect(() => {
        if (task_id) setShowModalTaskDetail(true);
    },[task_id]);

    const actionCallModaTask = (e) => {
        e.preventDefault();
        // dispatch(addEntityNote({}));
        setShowModalTaskDetail(true);
    }
    const actionCallModaTaskCallback = (commonNote) => {
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        setShowModalTaskDetail(false);
    }

    const fetchProject = () => {
        getProject({project_id},(err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const fetchProjectTaskList = () => {
        getProjectTaskList({limit:limit?limit:"", offset:offset?offset:"",project_id},(err,resp) => {
            if (!err) {
                dispatch(addTaskList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const paginateForward = () => {
        navigate(`/task/project/${project_id}?limit=50&offset=${parseInt(offset?offset:0)+50}`);
    }

    const paginateBackward = () => {
        navigate(`/task/project/${project_id}?limit=50&offset=${parseInt(offset)-50}`);
    }

    const navigateToActivity = () => {
        navigate(`/task/project/${project_id}/activity`);
    }

    const ActivityButton = (project) => {
        if (project.user_role === "OWNER") {
            return(
                <Button type="button" variant="" onClick={navigateToActivity} >
                    <i className="bi bi-info-circle"></i>
                </Button>
            )
        } else {
            return ""
        }
    }

    const listItems = Project.taskList.map((el,index) => 
        <ListGroup.Item key={index} 
            action href={`/task/project/${el.project_id}/${el.task_id}/`} // ??????? решить вопрос с url для деталей задачи
            onClick={(e) => {actionCallModaTask(e)}} 
            variant={el.is_closed === "Y"? "secondary":""}>
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{el.task_title}</h5>
                    <small>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
                </div>
                <p class="mb-1">
                    {el.executor_id?<><i class="bi bi-person"></i> {el.ru_executor_login} &nbsp;</> :""}
                    {el.ru_responsible_id?<><i class="bi bi-person-check"></i> {el.ru_responsible_login} &nbsp;</> :""}
                    {el.ru_reviewer_id?<><i class="bi bi-arrow-right"></i> {el.ru_reviewer_login} &nbsp;</> :""}
                </p>
                <small><Badge bg={el.variant}>{el.status_name}</Badge></small>
        </ListGroup.Item>
    )

    return (
    <Container>
    <ModalTask 
        fullscreen={true}
        show={showModalTaskDetail} 
        callBack={actionCallModaTaskCallback}
        // note={Disk.entityNote} 
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
                <Button type="button" variant="" onClick={actionCallModaTask} >
                    <i className="bi bi-plus-circle"></i>
                </Button>
                {  ActivityButton(Project.project) }
            </Form.Group>
            </div>
        </Col>
    </Row>
    <Row>
        <Col>
        <InputGroup>
            <Select 
                isMulti 
                closeMenuOnSelect={false} 
                placeholder="Статус" 
                options={Project.project.project_status_list.map(status => {
                        return {value : status.status_id, label : status.status_name}
                })}
            />
            &nbsp;
            <Select 
                isMulti 
                closeMenuOnSelect={false} 
                placeholder="Исполнитель" 
                options={Project.project.project_user_list.map(user => {
                    return {value : user.user_id, label : user.login}
                })}
            />
            &nbsp;
            <Select 
                isMulti 
                closeMenuOnSelect={false} 
                placeholder="Ответственный" 
                options={Project.project.project_user_list.map(user => {
                    return {value : user.user_id, label : user.login}
                })}
            />
            &nbsp;
            <Select 
                isMulti 
                closeMenuOnSelect={false} 
                placeholder="Ревьювер" 
                options={Project.project.project_user_list.map(user => {
                    return {value : user.user_id, label : user.login}
                })}
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
                <i class="bi bi-arrow-left-circle"></i>
            </a>:""
            }
            &nbsp;
            <a href="#" onClick={paginateForward} style={{fontSize:"1.6em"}}>
                <i class="bi bi-arrow-right-circle"></i>
            </a>
        </Col>
    </Row>
    </Container>
    );
}


export default TaskProjectList;