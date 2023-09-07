import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton} from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getProject } from "../../network/TaskNetwork";
import { addProject, addProjectList } from '../../reducers/Project';

function TaskProjectForm(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id } = useParams();

    const Project = useSelector((state) => state.project);
    
    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchProjectList();
    },[]);

    const fetchProjectList = () => {
        getProject({project_id},(err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

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
        <ListGroup.Item key={1} 
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
        </ListGroup.Item>
    </ListGroup>  
            
        </Col>
    </Row>
    </Container>
    );
}


export default TaskProjectForm;