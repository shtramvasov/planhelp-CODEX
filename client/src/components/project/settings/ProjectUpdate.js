import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { Container, Row, Col, Button, Form, Nav, Tab } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProject, postProject } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { Navbar } from '../../navbar/Navbar';
import TabBar from './TabBar';

const noText = "Проект без названия";

function ProjectUpdate(props) {

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
    const fetchUpdateProject = (project_name, project_note, is_deleted) => {
        postProject({ project_id, project_name, project_note, is_deleted }, (err, resp) => {
            if (!err) {
                if (is_deleted == 'Y') {
                    navigateToProjectList();
                } else {
                    fetchProject();
                }
            } else {
                alert("Ошибка: "+err);
            }
        })
    }

    const navigateToProjectList = () => {
        navigate(`/project`);
    }

    /// Удалить проект
    const handleDeleteProject = () => {
        fetchUpdateProject(Project.project_name, Project.project_note, 'Y')
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let project_name = e.target.formProjectName.value
        let project_note = e.target.formProjectNote.value
        fetchUpdateProject(project_name, project_note)
    }

    const Header = () => {
        return(
            <>
            <div>
                <h3> Настройки проекта </h3>
            </div>
            </>
        )
    };

    const ActionBar = () => {
        return(
            <>
            <Form.Group className="mb-3">
                <Button style={{marginLeft : "2px"}} type="submit" variant="outline-success">Сохранить изменения</Button>
                <Button style={{marginLeft : "2px"}} type="button" variant="outline-danger" onClick={handleDeleteProject}><i className="bi bi-trash"></i></Button>
            </Form.Group>
            </>
        )
    }

    return (
        <Container fluid>
            <Row>
                <Col>
                    <Navbar />
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Breadcrumb 
                        items={[
                            {url:`/`, name: "Мои проекты"}, 
                            {url:`/project/${project_id}/list`, name: Project.project_name},
                            {url:``, name: 'Настройка проекта'}
                        ]}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <TabBar />
                    <br/>
                </Col>
            </Row>
            <Row>
                <Col>
                    { Header() }
                </Col>
            </Row>
            <form onSubmit={handleSubmit}>
            <Row style={{marginTop: "8px"}}>
                <Col>
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
            <Row>
                <Col>
                    { ActionBar() }
                </Col>
            </Row>
            </form>
        </Container>
    );
}


export default ProjectUpdate;