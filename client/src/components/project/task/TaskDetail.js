import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject } from "../../../network/TaskNetwork";
import { addProject, addTaskList } from '../../../reducers/Project';
import Select from 'react-select';
import TaskForm from "./TaskForm";
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function TaskDetail(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, task_id } = useParams();
    const Project = useSelector((state) => state.project);

    useEffect(() => {
        fetchProject();
    },[]);

    const fetchProject = () => {
        getProject({project_id},(err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    return (
    <Container fluid>
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
                    {url:`/project/${Project.project.project_id}/list`, name: Project.project.project_name},
                    {url:``, name: `${Project.task.task_title}`}
                ]}
            />
            </Col>
        </Row>
        <Row>
            <Col>
                
                    <h5>Задача #{task_id}&nbsp;
                    <span style={{fontWeight: "200", fontSize: "0.8em"}}>
                        создана {moment(Project.task.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')} ({Project.task.ru_created_login})
                        {Project.task.closed_on?", закрыта " + moment(Project.task.closed_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL') : ""}
                    </span>
                    </h5>
                    <hr/>
                <div>
                <TaskForm project_id={project_id} task_id={task_id} />
                </div>
            </Col>
        </Row>
    </Container>
    )
}

export default TaskDetail;