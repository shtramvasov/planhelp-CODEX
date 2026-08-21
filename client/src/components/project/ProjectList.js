import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getProjectList } from "../../network/TaskNetwork";
import { addProjectList } from '../../reducers/Project';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function ProjectList(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const Project = useSelector((state) => state.project);
    const User = useSelector((state) => state.user);

    // Первичная загрузка данных,
    // Последующие загрзки при измененеии entity_id
    useEffect(() => {
        fetchProjectList();
    },[]);

    const fetchProjectList = () => {
        getProjectList({},(err,resp) => {
            if (!err) {
                dispatch(addProjectList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const navigateToDetail = (project, e) => {
        e.preventDefault();
        let projectId = project.project_id
        navigate(`/project/${projectId}/list`);
    }

    const listItems = Project.projectList.map((el) => {
        return <>
        <Col lg={6}>
            <a href={`/project/${el.project_id}/list`} style={{textDecoration: "none", color: "inherit"}}>
            <div className="card mb-3" onClick={ (e) => { navigateToDetail(el,e) } }>
            <div className="row">
                <div className="col-md-8">
                <div className="card-body">
                    <h5 className="card-title">{el.project_name}</h5>
                    <p className="card-text">{el.project_note}</p>
                    <p className="card-text">
                        <small className="text-body-secondary">
                            Проект создан: { moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow() } <br />
                            
                            <i style={{color : "#555"}}className="bi bi-people-fill"></i> 
                            &nbsp;<Badge bg="secondary">{el.total_user_count}</Badge>                            
                            &nbsp;&nbsp;&nbsp;
                            {el.status_id?<>
                                <i style={{color : "#555"}}className="bi bi-person"></i> 
                                {User.profile.login}
                                &nbsp;<Badge bg="secondary">{el.status_id ? el.user_project_task_open_count:""}</Badge>
                            </>
                            :""}
                            
                            
                            
                        </small>
                    </p>
                </div>
                </div>
            </div>
            </div>
            </a>
        </Col>
        </>
    });

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
            <Button variant="outline-primary" onClick={() => navigate(`/project/add`)}>
                <i className="bi bi-journal-plus"></i>
            </Button>
        </Col>
    </Row>
    <div style={{marginTop: "16px"}}></div>
    <Row>
        {listItems}
    </Row>
    </Container>
    );
}


export default ProjectList;