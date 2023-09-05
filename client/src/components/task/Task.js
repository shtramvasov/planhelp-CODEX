import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { getProjectList } from "../../network/TaskNetwork";
import { addProjectList } from '../../reducers/Project';

function Task(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    document.title = "Мои проекты | planhelp";

    const Project = useSelector((state) => state.project);

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

    const listItems = Project.projectList.map((el) => {
        return <>
        <Col lg={6}>
            <div className="card mb-3">
            <div className="row">
                <div className="col-md-8">
                <div className="card-body">
                    <h5 className="card-title">{el.project_name}</h5>
                    <p className="card-text">{el.project_note}</p>
                    <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p>
                </div>
                </div>
            </div>
            </div>
        </Col>
        </>
    });

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
            <Button variant="outline-primary" onClick={() => navigate(`/task/project/add`)}>
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


export default Task;