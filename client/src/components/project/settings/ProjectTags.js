import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Badge, Button, Col, Container, Form, ListGroup, Modal, Row, Stack, Table } from 'react-bootstrap';
import { getProject, postProjectTag, deleteProjectTag } from '../../../network/TaskNetwork';
import { addProject } from '../../../reducers/Project';
import { getUsers } from "../../../network/UserNetwork";
import { addUserList } from "../../../reducers/User";
import TabBar from './TabBar';
import { Navbar } from '../../navbar/Navbar';
import Breadcrumb from "../../helpers/Breadcrumb";
import ModalOneInputText from "../../helpers/ModalOneInputText";
moment.locale('ru');

function ProjectTags(props) {
    
    const dispatch = useDispatch();

    const Project = useSelector((state) => state.project.project);
    const { project_id } = useParams();
    // Модалка для создания тэга
    const [showModalCreateTag, setShowModalCreateTag] = useState(false);

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
    
    /// Создать tag
    const fetchTagCreate = (tag) => {
        postProjectTag({ project_id: project_id, 
            tag : tag
           }, (err, resp) => {
               if (!err) {
                   fetchProject()
               } else {
                   alert("Ошибка: " + err);
               }
           })
    };

    const fetchTagDelete = ({tag_id, project_id}) => {
        
        deleteProjectTag(
            { project_id: project_id, tag_id : tag_id }, 
            (err, resp) => {
                if (!err) {
                    fetchProject()
                } else {
                    alert("Ошибка: " + err);
                }
        })
    }

    // Вызов модалки, для создания тэга
    const actionCallModalCreateStatus = (e) => {
        e.preventDefault();
        setShowModalCreateTag(true);
    }

    const actionCallBackModalCreateTag = (newTag) => {
        setShowModalCreateTag(false);
        if (!newTag) { return; }
        fetchTagCreate(newTag);
    }

    const tagList = Project.project_tag_list.map((el) =>
        <div key={el.tag_id} style={{display: "inline", paddingRight: "6px"}}>
            <Badge bg="secondary"> 
                {el.tag}
            </Badge>
            <Button style={{padding: "0px"}} type="button" variant="" onClick={ e => 
                    fetchTagDelete({tag_id : el.tag_id, project_id : project_id}) 
                }> 
                <i className="bi bi-x"></i> 
            </Button>
        </div>
    );

    return(
        <>
            <ModalOneInputText title={"Новый тэг"} show={showModalCreateTag} callBack={actionCallBackModalCreateTag} />
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
                    <div style={{float:"left", paddingRight:"4px"}}>
                        <h3> Тэги проекта </h3>
                    </div>
                    <div>
                        <Form.Group className="mb-3">
                            <Button type="button" variant="" onClick={ actionCallModalCreateStatus } >
                                <i className="bi bi-plus-circle" />
                            </Button>
                        </Form.Group>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    {tagList}
                </Col>
            </Row>
            </Container>
        </>
    )

}

export default ProjectTags;