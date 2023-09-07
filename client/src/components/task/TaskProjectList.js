import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton} from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../helpers/Breadcrumb";

function TaskProjectForm(props) {

    const navigate = useNavigate();
    const { project_id } = useParams();

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
                {url:`/task/project/add`, name: "Список задач"}
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
            <h2>Задачи проекта</h2>
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
                    <h5 class="mb-1">Conveying meaning to assistive technologies Android / ios</h5>
                    <small>3 дня назад</small>
                </div>
                
                <p class="mb-1">forson</p>
                <small><Badge bg="success">New</Badge></small>
                
        </ListGroup.Item>
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Сделать то-то</h5>
                    <small>3 дня назад</small>
                </div>
                <p class="mb-1">forson</p>
                <small>predeinay</small>
        </ListGroup.Item>
        <ListGroup.Item key={1} 
            action href={"https://ya.ru"}
            onClick={(e) => {}} 
            variant="dark">
                <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">List group item heading</h5>
      <small>3 days ago</small>
    </div>
    <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
    <small>Donec id elit non mi porta.</small>
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