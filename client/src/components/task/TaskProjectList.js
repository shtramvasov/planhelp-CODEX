import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton} from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject, getProjectTaskList } from "../../network/TaskNetwork";
import { addProject, addTaskList } from '../../reducers/Project';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function TaskProjectForm(props) {
    const [ searchParams ] = useSearchParams();
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id } = useParams();

    const Project = useSelector((state) => state.project);
    
    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchProject();
    },[]);

    useEffect(() => {
        fetchProjectTaskList();
    },[offset])

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

    const listItems = Project.taskList.map((el,index) => 
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant={el.is_closed === "Y"? "secondary":""}>
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{el.task_title}</h5>
                    <small>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
                </div>
                <p class="mb-1">
                    {el.executor_id?<><i className="bi bi-person"></i> {el.ru_executor_login} &nbsp;</> :""}
                    {el.ru_responsible_id?<><i className="bi bi-person-check"></i> {el.ru_responsible_login} &nbsp;</> :""}
                    {el.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {el.ru_reviewer_login} &nbsp;</> :""}
                </p>
                <small><Badge bg={el.variant}>{el.status_name}</Badge></small>
        </ListGroup.Item>
    )

    return (
    <Container>
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
                {url:`/task/project/add`, name: Project.project.project_name}
            ]}
        />
        </Col>
    </Row>
    <Row>
        <Col>
            <Button variant="outline-primary" onClick={() => navigate(`/task/project/add`)}>
                <i className="bi bi-clipboard-plus"></i>
            </Button>
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col>
            <h2>{Project.project.project_name}</h2>
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col lg={12}>
        <ListGroup>
            {listItems}
        {/* <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">JavaScript behavior WEB / ЛК УК</h5>
                    <small>3 дня назад</small>
                </div>
                
                <p class="mb-1">
                    <i className="bi bi-person"></i> forson &nbsp;
                    <i className="bi bi-person-check"></i> predeinay &nbsp;
                    <i className="bi bi-arrow-right"></i> timofey &nbsp;
                </p>
                <small><Badge bg="success">New</Badge></small>
                
        </ListGroup.Item>
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Conveying meaning to assistive technologies Android / ios</h5>
                    <small>3 дня назад</small>
                </div>
                
                <p class="mb-1">
                    <i className="bi bi-person"></i> forson &nbsp;
                    <i className="bi bi-person-check"></i> predeinay &nbsp;
                    <i className="bi bi-arrow-right"></i> timofey &nbsp;
                </p>
                <small><Badge bg="warning">Testing</Badge></small>
        </ListGroup.Item>
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="secondary">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Conveying meaning to assistive technologies Android / ios</h5>
                    <small>3 дня назад</small>
                </div>
                
                <p class="mb-1">
                    <i className="bi bi-person"></i> dmk &nbsp;
                    <i className="bi bi-person-check"></i> predeinay &nbsp;
                    <i className="bi bi-arrow-right"></i> timofey &nbsp;
                </p>
                <small><Badge bg="secondary">Close</Badge></small>
        </ListGroup.Item>
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="secondary">
                <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">List group item heading</h5>
      <small>3 days ago</small>
    </div>
    <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
    <small>Donec id elit non mi porta.</small>
        </ListGroup.Item> */}
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


export default TaskProjectForm;