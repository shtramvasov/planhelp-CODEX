import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Form, Nav } from 'react-bootstrap';
import { Route, Routes, useNavigate , useLocation, Link} from "react-router-dom";
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

function TabBar(props) {
    const location = useLocation();
    const { project_id } = useParams();

    return (
        <Nav variant='tabs' defaultActiveKey={ window.location.pathname }>
            <Nav.Item>
                <Nav.Link as={Link} to={`/project/${project_id}/settings`}
                    active={location.pathname == (`/project/${project_id}/settings`)}>Основное</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link as={Link} to={`/project/${project_id}/settings/access`}
                    active={location.pathname == (`/project/${project_id}/settings/access`)}>Команда</Nav.Link>
            </Nav.Item>

            <Nav.Item>
                <Nav.Link as={Link} to={`/project/${project_id}/settings/status`} 
                    active={location.pathname == (`/project/${project_id}/settings/status`)}>Статусы</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to={`/project/${project_id}/settings/tags`} 
                    active={location.pathname == (`/project/${project_id}/settings/tags`)}>Тэги</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link as={Link} to={`/project/${project_id}/settings/subject`} 
                    active={location.pathname == (`/project/${project_id}/settings/subject`)}>Сущности</Nav.Link>
            </Nav.Item>
        </Nav>
    );
}


export default TabBar;
