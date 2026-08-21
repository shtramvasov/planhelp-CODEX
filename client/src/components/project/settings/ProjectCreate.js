import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { postProject } from "../../../network/TaskNetwork";

function ProjectCreate(props) {

    const navigate = useNavigate();
    const { project_id } = useParams();
    const handleSubmit = (e) => {
        e.preventDefault();
        postProject(
            {   
                project_id : project_id,
                project_name : e.target.formProjectName.value,
                project_note : e.target.formProjectNote.value
            }, 
            (err,resp) => {
                if (!err) {
                    // handleCancelClick();
                    // fetchEntity();
                    navigate("/project")
                }
            }
        );
    }

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
                {url:`/project/add`, name: "Добавить новый проект"}
            ]}
        />
        </Col>
    </Row>
    <Row style={{marginTop: "8px"}}>
        <Col lg={6}>
        <form onSubmit={handleSubmit}>
        <Row>
            <Col>
                <Form.Group className="mb-3" controlId="formProjectName">
                <Form.Control 
                    controlid="formProjectName"
                    // defaultValue={Disk.entity.entity_name} 
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
                    // defaultValue={Disk.entity.entity_name} 
                    type="text" 
                    as="textarea"
                    rows={4}
                    placeholder="Описание проекта" />
                </Form.Group>
            </Col>
        </Row>
        <Row>
            <Col>
                <Form.Group className="mb-3">
                    <Button type="submit" variant="outline-success" >Сохранить</Button>
                </Form.Group>
            </Col>
        </Row>  
        </form>
            
        </Col>
    </Row>
    </Container>
    );
}


export default ProjectCreate;