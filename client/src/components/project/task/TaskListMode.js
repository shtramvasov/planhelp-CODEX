import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { getProject, getProjectTaskList, postTask } from "../../../network/TaskNetwork";
import { addProject, addTaskList } from '../../../reducers/Project';
import queryString from "query-string";
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function TaskListMode(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();
    const { project_id } = useParams();

    const Project = useSelector((state) => state.project);
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const executor_id = searchParams.get("executor_id");
    const responsible_id = searchParams.get("responsible_id");
    const reviewer_id = searchParams.get("reviewer_id");
    const status_id = searchParams.get("status_id");
    const tag_id = searchParams.get("tag_id");
    const date_start = searchParams.get("date_start");
	const date_end = searchParams.get("date_end");
    const search = searchParams.get("search"); 
    const filter_psi_ids = searchParams.get("filter_psi_ids"); 

    useEffect(() => {
        // загрузка данных о задачах
        fetchProjectTaskList();
    },[offset, executor_id, status_id, responsible_id, reviewer_id, tag_id, date_start, date_end, search, filter_psi_ids])

    // достаем задачи с апи
    const fetchProjectTaskList = () => {
        getProjectTaskList({
            limit, offset, project_id,
            status_id, executor_id, responsible_id, reviewer_id, tag_id,
            date_start, date_end, search, 
            filter_psi_ids,
            sort : "task_id"
        },(err,resp) => {
            if (!err) {
                dispatch(addTaskList(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const onChangeUrl = ({status_id, executor_id, responsible_id, reviewer_id, tag_id, offset, limit}) => {
        
        const currentUrlObj = queryString.parse(document.location.search.slice(1));
        
        if (status_id !== undefined) currentUrlObj.status_id = status_id;
        if (executor_id !== undefined) currentUrlObj.executor_id = executor_id;
        if (responsible_id !== undefined) currentUrlObj.responsible_id = responsible_id;
        if (reviewer_id !== undefined) currentUrlObj.reviewer_id = reviewer_id;
        if (tag_id !== undefined) currentUrlObj.tag_id = tag_id;
        if (limit !== undefined) currentUrlObj.limit = limit;
        if (offset !== undefined) currentUrlObj.offset = offset;
        if (search !== undefined) currentUrlObj.search = search;
        if (filter_psi_ids !== undefined) currentUrlObj.filter_psi_ids = filter_psi_ids;

        navigate(`/project/${project_id}/list?${queryString.stringify(currentUrlObj)}`);
        
    }

    const paginateForward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset?offset:0)+50});
    }
    const paginateBackward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset)-50});
    }

    const actionCallModaTaskEdit = props.actionCallModaTaskEdit;
    // Список задачи
    const listItems = Project.taskList.map((el,index) => 
        <ListGroup.Item key={index} 
            action active={false} href={`/project/${el.project_id}/task/${el.task_id}/`} 
            onClick={(e) => {actionCallModaTaskEdit(e, {project_id : el.project_id, task_id : el.task_id})}} 
            variant={el.is_closed === "Y"? "secondary":""}>
                <Row>
                    <Col md={6}>
                        <span style={{color: "gray",fontSize : "0.7em"}}>#{el.task_id}</span>&nbsp;
                        <span style={{color: "gray",fontSize : "0.7em"}}>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}</span>
                        <div style={{marginTop: "6px"}}>
                            <h6 className="mb-1">{el.task_title}</h6>
                        </div>
                        <div>
                            {el.tags_str?.split(',').map((el) =>
                                <div key={el} style={{display: "inline", paddingRight: "6px"}}>
                                    <Badge bg="secondary"> 
                                        {el}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col style={{margin: "auto"}}>
                        <p className="mb-1" style={{fontSize: "0.8em"}}>
                        {el.executor_id?<><i className="bi bi-person"></i> {el.ru_executor_login} &nbsp;</> :""}
                        {el.ru_responsible_id?<><i className="bi bi-person-check"></i> {el.ru_responsible_login} &nbsp;</> :""}
                        {el.ru_reviewer_id?<><i className="bi bi-arrow-right"></i> {el.ru_reviewer_login} &nbsp;</> :""}
                        {el.comments_files_count.split(":")[0] != 0? 
                                    <>
                                        <i style={{color: "#555"}}className="bi bi-chat-text-fill"></i> {el.comments_files_count.split(":")[0]}
                                    </>
                                    : ""}
                        </p>
                    </Col>
                    <Col xs={"auto"} style={{margin: "auto"}}>
                        <small><Badge bg={el.status_id?el.variant:"secondary"}>{el.status_id?el.status_name:"Без статуса"}</Badge></small>
                    </Col>
                </Row>
        </ListGroup.Item>
    );

    return (
    <>
        <Row>
            <Col>
                <ListGroup>
                    {listItems}
                </ListGroup>
            </Col>
        </Row>
        <Row style={{marginBottom: "16px",marginTop: "16px"}}>
            <Col>
            
                {offset!=0?
                <a href="#" onClick={paginateBackward} style={{fontSize:"1.6em"}}>
                    <i className="bi bi-arrow-left-circle"></i>
                </a>:""
                }
                &nbsp;
                {Project.taskList.length == limit ?
                <a href="#" onClick={paginateForward} style={{fontSize:"1.6em"}}>
                    <i className="bi bi-arrow-right-circle"></i>
                </a> : <span style={{fontSize:"1.6em", color : "silver"}}><i className="bi bi-arrow-right-circle"></i></span>
                }
            </Col>
        </Row>
    </>
    );
}


export default TaskListMode;