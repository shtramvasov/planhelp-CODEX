import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProject, postProject } from '../../network/TaskNetwork';
import { addProject } from '../../reducers/Project';
import { Navbar } from '../navbar/Navbar';

function TaskProjectUpdate(props) {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { project_id } = useParams();

    const Project = useSelector((state) => state.project.project);

    // Первичная загрузка данных
    useEffect(() => { fetchProject()},[]);

    /// Детали проекта
    const fetchProject = () => {
        getProject({project_id}, (err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    // Обновить проект
    const fetchUpdatePrject = (project_name, project_note, is_deleted) => {
        postProject({ project_id, project_name, project_note, is_deleted }, (err, resp) => {
            if (!err) {
                is_deleted == 1 ? navigateToProjectList() : handleCancelEntity()
            } else {
                alert("Ошибка: "+err);
            }
        })
    }

    const handleCancelEntity = () => {
        navigate(`/task/project/${project_id}`);
    }

    const navigateToProjectList = () => {
        navigate(`/task`);
    }

    /// Удалить проект
    const handleDeleteProject = () => {
        fetchUpdatePrject(Project.project_name, Project.project_note, 1)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let project_name = e.target.formProjectName.value
        let project_note = e.target.formProjectNote.value
        fetchUpdatePrject(project_name, project_note)
    }

    const Header = () => {
        return(
            <>
            <div>
                <h2> Изменить проект </h2>
            </div>
            </>
        )
    };

    const ActionBar = () => {
        return(
            <>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-secondary" onClick={handleCancelEntity} ><i className="bi bi-chevron-left"></i></Button>
                <Button style={{marginLeft : "2px"}} type="submit" variant="outline-success">Сохранить изменения</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={handleDeleteProject}><i className="bi bi-trash"></i></Button>
            </Form.Group>
            </>
        )
    }

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
                        {url:``, name: Project.project_name} 
                        ]}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    { Header() }
                </Col>
            </Row>
            <form onSubmit={handleSubmit}>
            <Row>
                <Col>
                    { ActionBar() }
                </Col>
            </Row>
            <Row style={{marginTop: "8px"}}>
                <Col lg={6}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formProjectName">
                            <Form.Control 
                                controlid="formProjectName"
                                defaultValue={Project.project_name} 
                                type="text" 
                                placeholder="Название проекта" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formProjectNote">
                            <Form.Control 
                                controlid="formProjectNote"
                                defaultValue={Project.project_note} 
                                type="text" 
                                as="textarea"
                                rows={4}
                                placeholder="Описание проекта" />
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
            </Row>
            </form>
        </Container>
    );
}


export default TaskProjectUpdate;