import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { useSelector, useDispatch } from 'react-redux';
import { getSprintList, getSprintDetail } from "../../../network/SprintNetwork";
import { addSprint, addSprintList } from '../../../reducers/Project';
import TabBar from "../TabBar";
import moment from 'moment-timezone';
import 'moment/locale/ru';


const noText = "Проект без названия";

function SprintList(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ searchParams ] = useSearchParams();

    const { project_id } = useParams();
    
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;

    const Project = useSelector((state) => state.project);

    useEffect(() => {
        // загрузка данных о задачах
        fetchProjectSprintList();
        // лайфхак... 
        dispatch(addSprint({}));
    },[offset])

    const navigateToCreate = () => {
        navigate(`/project/${project_id}/sprint/add`);
    }

    const navigateToEdit = (sprint_id) => {
        navigate(`/project/${project_id}/sprint/${sprint_id}/edit`);
    }

    const navigateToTaskList = (sprint_id) => {
        navigate(`/project/${project_id}/sprint/${sprint_id}/task`);
    }
    
    const fetchProjectSprintList = () => {
        getSprintList({
            limit:limit?limit:"", offset:offset?offset:"",project_id
        },(err,resp) => {
            if (!err) {
                dispatch(addSprintList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };
    const listItems = Project.sprintList.map((sprint, index) => 
        <ListGroup.Item key={index}>
            <Row>
                <Col>
                    <Button type="button" variant="" onClick={ () => {navigateToEdit(sprint.sprint_id)} } >
                        <i className="bi bi-pencil-square"></i>
                    </Button>
                </Col>
                <Col>
                    {moment(sprint.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')} - {moment(sprint.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')}
                </Col>
                <Col>
                    {sprint.sprint_name}
                </Col>
                <Col>
                    {sprint.status == '0' ? <Badge bg="success">Открыт</Badge> : <Badge bg="secondary">Закрыт</Badge>}
                </Col>
                <Col>
                    {moment(sprint.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}
                </Col>
            </Row>
        </ListGroup.Item>
    );
    
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
                    {url:``, name: Project.project?.project_name.trim()?Project.project.project_name:noText}
                ]}
            />
            </Col>
        </Row>
        <Row>
            <Col>
                <TabBar />
            </Col>
        </Row>
        <Row style={{marginTop : "14px"}}>
            <Col>
                <Form.Group className="mb-3">
                    <Button type="button" variant="" onClick={ navigateToCreate } >
                        <i className="bi bi-plus-circle"></i>
                    </Button>
                </Form.Group>
            </Col>
        </Row>
        <Row>
            <Col>
                <ListGroup>
                    {listItems}
                </ListGroup>
            </Col>
        </Row>
        </Container>
    )
}


export default SprintList;
