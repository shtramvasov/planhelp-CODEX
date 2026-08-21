import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Nav } from 'react-bootstrap';
import { Route, Routes, useNavigate , useLocation, Link} from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProject } from "../../network/TaskNetwork";
import { addProject, addTaskList } from '../../reducers/Project';

const noText = "Проект без названия";

function TabBar(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { project_id } = useParams();
    const Project = useSelector((state) => state.project);

    const navigateToEditProject = () => {
        navigate(`/project/${project_id}/settings`)
    }

    // Первичная загрузка данных
    useEffect(() => {
        // загрузка данных о проекте
        fetchProject();
    },[]);

    // достаем проект с апи
    const fetchProject = () => {
        getProject({project_id},(err,resp) => {
            if (!err) {
                dispatch(addProject(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };


    // кастомные тематики конкретного проекта
    const projectSubjectList = Project.project.project_subject_list
        .filter( project_subject => project_subject.subject_type === "LOV")
        .map((el) => 
        <Nav.Item key={el.subject_id}>
            <Nav.Link as={Link} to={`/project/${project_id}/subject/${el.subject_id}`}
                    active={location.pathname.startsWith(`/project/${project_id}/subject/${el.subject_id}`)}>{el.subject_name}</Nav.Link>
        </Nav.Item>
    )

    return (
        <>
        <div>
            <h2 style={{ cursor: "pointer" }}  onClick={navigateToEditProject}>
                { Project.project?.project_name.trim()?Project.project.project_name:noText }
            </h2>
        </div>
        <div>
            <Nav variant='tabs' defaultActiveKey={ window.location.pathname }>
                <Nav.Item>
                    <Nav.Link as={Link} to={`/project/${project_id}/list${location.pathname.startsWith(`/project/${project_id}/subject`)?"":location.search}`} //${location.search}
                        active={
                            location.pathname.startsWith(`/project/${project_id}/list`) || 
                            location.pathname == (`/project/${project_id}`)
                            }
                    >Задачи</Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link as={Link} to={`/project/${project_id}/board${location.pathname.startsWith(`/project/${project_id}/subject`)?"":location.search}`} //${location.search}
                        active={
                            location.pathname.startsWith(`/project/${project_id}/board`)
                        }
                    >Канбан</Nav.Link>
                </Nav.Item>
                {projectSubjectList}
            </Nav>
        </div>
        </>
    );
}


export default TabBar;
