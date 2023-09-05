import { Navbar }  from "../navbar/Navbar";
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

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

    <Row style={{marginTop: "8px"}}>
        <Col lg={6}>
            
            Project List
            
        </Col>
    </Row>
    </Container>
    );
}


export default TaskProjectForm;