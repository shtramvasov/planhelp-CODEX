import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { Container, Row, Col, Button, Form, Nav } from 'react-bootstrap';
import { Route, Routes, useNavigate , useLocation, Link} from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProject, postProject } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { Navbar } from '../../navbar/Navbar';

import ProjectAccess from './ProjectAccess';
import ProjectUpdate from './ProjectUpdate';
import ProjectStatus from './ProjectStatus';

const noText = "Проект без названия";

function ProjectSettings(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { project_id } = useParams();

    const Project = useSelector((state) => state.project.project);
    document.title = `Изменить ${Project.project?.project_name.trim()?Project.project.project_name:noText} | planhelp`;

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
    
    const TabBar = () => {
        return(
            <>
            <Nav variant='tabs' defaultActiveKey={ window.location.pathname }>
                <Nav.Item>
                    <Nav.Link as={Link} to={`/project/${project_id}/settings`}
                        active={location.pathname == (`/project/${project_id}/settings`)}> Настрока проекта </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link as={Link} to={`/project/${project_id}/settings/access`}
                        active={location.pathname == (`/project/${project_id}/settings/access`)}> Настрока доступа </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link as={Link} to={`/project/${project_id}/settings/status`} 
                        active={location.pathname == (`/project/${project_id}/settings/status`)}> Настрока статусов </Nav.Link>
                </Nav.Item>
            </Nav>
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
                </Col>
            </Row>
            <br />
            <Row>
                <Col>
                    <Routes>
                        <Route path='/' element={ <ProjectUpdate /> } />
                        <Route path='/access' element={ <ProjectAccess /> } />
                        <Route path='/status' element={ <ProjectStatus /> } />
                    </Routes>
                </Col>
            </Row>

        </Container>
    );
}


export default ProjectSettings;
