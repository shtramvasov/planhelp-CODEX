import { Navbar }  from "../../navbar/Navbar";
import { Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import Breadcrumb from "../../helpers/Breadcrumb";
import { addPositiveMessage, addNegativeMessage } from '../../../reducers/App';
import { addProjectSubjectItemList, addProjectSubject, addProjectSubjectItem } from '../../../reducers/Project';
import { getProjectSubjectItemList,getProjectSubject, getProjectSubjectItem, postProjectSubjectItem } from '../../../network/ProjectSubject';
import { useSelector, useDispatch } from 'react-redux';
import TabBar from "../TabBar";
import SubjectItemModalForm from './SubjectItemModalForm';
import SubjectTaskModalList from "./SubjectTaskModalList";
import { messages } from "../../constants/Msg";
import moment from 'moment-timezone';
import 'moment/locale/ru';
import queryString from "query-string";
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function SubjectItemList(props) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();
    const { project_id, subject_id } = useParams();
    const Project = useSelector((state) => state.project);
    const project_subject_item = useSelector((state) => state.project.project_subject_item);
    const psi_id = searchParams.get("psi_id");
    const filter_psi_ids = searchParams.get("filter_psi_ids");
    const action = searchParams.get("action");
    const limit = searchParams.get("limit") || 50;
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const status = searchParams.get("status");

    // Модалка для добавления/изменения тематики в проект
    const [showModalSubjectItemModalForm, setShowModalSubjectItemModalForm] = useState(false);
    const [showSubjectTaskModalList, setShowSubjectTaskModalList] = useState(false);

    // Первичная загрузка данных
    useEffect(() => { 
        // чтобы не скакали данные из редакса
        dispatch(addProjectSubjectItemList([]));
        fetchProjectSubjectItems();
        fetchProjectSubject();
    },[subject_id, offset, status]);

    // call edit modal
    useEffect(() => {
        if (psi_id) {
            dispatch(addProjectSubjectItem({}));
            fetchProjectSubjectItem();
            setShowModalSubjectItemModalForm(true);
        } else
        if (filter_psi_ids) {
            setShowSubjectTaskModalList(true);
            // запросим детали кликнутой сущности
            fetchProjectSubjectItem({filter_psi_ids});
        } else 
        if (action) {
            dispatch(addProjectSubjectItem({status : 1}));
            setShowModalSubjectItemModalForm(true);
        } else {
            setShowModalSubjectItemModalForm(false);
            setShowSubjectTaskModalList(false);
        }
    },[psi_id,action, filter_psi_ids])

    // Список psi
    const fetchProjectSubjectItems = () => {
        getProjectSubjectItemList({project_id, subject_id, limit : limit, offset : offset, status}, (err,resp) => {
            if (!err) {
                dispatch(addProjectSubjectItemList(resp));
            } else {
                dispatch(addNegativeMessage(messages.FETCH_FAIL));
            }
        });
    };

    const fetchProjectSubject = () => {
        getProjectSubject({project_id, subject_id}, (err, resp) => {
            if (!err) {
                dispatch(addProjectSubject(resp));
            } else {
                dispatch(addNegativeMessage(messages.FETCH_FAIL));
            }
        });
    }

    const fetchProjectSubjectItem = (params) => {
        let filter_psi_ids = null;
        if (params) {
            filter_psi_ids = params.filter_psi_ids;
        }
        // filter_psi_ids сильно на костыль похоже
        // может в будущем сделать как то иначе ??
        getProjectSubjectItem({project_id, subject_id, psi_id : filter_psi_ids ? filter_psi_ids : psi_id}, (err, resp) => {
            if (!err) {
                dispatch(addProjectSubjectItem(resp));
            } else {
                dispatch(addNegativeMessage(messages.FETCH_FAIL));
            }
        });
    }

    const actionCallModalItemCreate = () => {
        // navigate(`?action=create`);
        onChangeUrl({action : "create"});
    }

    const actionCallModalItemEdit = (e, project_subject_item) => {
        e.preventDefault();
        onChangeUrl({psi_id:project_subject_item.psi_id});
        // navigate(`?psi_id=${project_subject_item.psi_id}`);
    }

    const actionCallBackSubjectItemModalForm = (isSave) => {
        // navigate(`${window.location.pathname}`);
        onChangeUrl({psi_id : "", action : ""});
        console.log(project_subject_item);
        if (isSave) {
            console.log("date_start", project_subject_item.date_start);
            postProjectSubjectItem({
                project_id, 
                subject_id,
                psi_name : project_subject_item.psi_name,
                psi_id : project_subject_item.psi_id,
                date_start : project_subject_item.date_start,
                date_end : project_subject_item.date_end,
                status : project_subject_item.status,
                psi_note : project_subject_item.psi_note
            }, (err, resp) => {
                if (!err) {
                    fetchProjectSubjectItems();
                } else {
                    dispatch(addNegativeMessage(messages.SAVE_FAIL));
                }
            });
        }
    }

    const actionDeleteSubjectItem = ({psi_id}) => {
        postProjectSubjectItem({
            project_id, 
            subject_id,
            psi_id,
            status : 0
        }, (err, resp) => {
            if (!err) {
                fetchProjectSubjectItems();
            } else {
                dispatch(addNegativeMessage(messages.SAVE_FAIL));
            }
        });
    }

    const onChangeUrl = ({status, offset, limit, psi_id, action, filter_psi_ids}) => {
        
        const currentUrlObj = queryString.parse(document.location.search.slice(1));
        
        if (limit !== undefined) currentUrlObj.limit = limit;
        if (offset !== undefined) currentUrlObj.offset = offset;
        if (status !== undefined) currentUrlObj.status = status;
        if (psi_id !== undefined) currentUrlObj.psi_id = psi_id;
        if (action !== undefined) currentUrlObj.action = action;
        if (filter_psi_ids !== undefined) currentUrlObj.filter_psi_ids = filter_psi_ids;
        
        
        navigate(`/project/${project_id}/subject/${subject_id}?${queryString.stringify(currentUrlObj)}`);
    }

    const actionCallModalTaskList = (psi_id) => {
        onChangeUrl({filter_psi_ids : psi_id});
        // fetchTaskList

    }

    const actionCallBackModalTaskList = () => {
        onChangeUrl({filter_psi_ids : ""});
    }

    const paginateForward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset?offset:0)+50});
    }
    const paginateBackward = () => {
        onChangeUrl({limit : 50, offset: parseInt(offset)-50});
    }

    const projectSubjectItems = Project.project_subject_item_list.map((el) =>
        <ListGroup.Item key = {el.psi_id}>
        <Row key = {el.psi_id} style={{cursor: "pointer"}} >
            {/* <Col xs="auto">
                <Button type="button" 
                    variant="outline-secondary" 
                    style={{ marginRight: '10px' }} 
                    onClick={ e => actionCallModalItemEdit(e, el) }
                    >
                    <i className="bi bi-pencil-fill"></i> 
                </Button>
            </Col> */}
            <Col sm={8}>
                <div>
                    <a href={`/project/${project_id}/subject/${subject_id}?psi_id=${el.psi_id}`}
                        onClick={ e => actionCallModalItemEdit(e, el) } className="phLink">{el.psi_name.trim()?el.psi_name.trim():"Без названия"}</a>
                </div>
                <div style={{marginTop: "6px"}}>
                    <small>{el.psi_note}</small>
                </div>
                <div style={{ fontSize: "0.8em", marginTop: "6px"}}>
                    {el.date_start ? ` с ${moment(el.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')}` : ""}
                    {el.date_end ? ` до ${moment(el.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM.YYYY')}` : ""}
                </div>
                <div style={{marginTop: "6px"}}>
                    <Badge bg={el.status == "1" ? "success" : "secondary"}> 
                        {el.status == "1" ? "" : "В архиве"}
                    </Badge>
                </div>
            </Col>
            <Col onClick={(e) => {e.preventDefault(); actionCallModalTaskList(el.psi_id);}} sm="2" style={{textAlign: "center", margin: "auto"}}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={el.open_close_count ? 
                            Math.round(parseInt(100*(el.open_close_count.split(';')[0]) / parseInt(el.open_close_count.split(';')[1])))
                            : 0} />
                    <Box
                        sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        }}
                    >
                        <Typography
                        variant="caption"
                        component="div"
                        sx={{ color: 'text.secondary' }}
                        >{el.open_close_count ? el.open_close_count.replace(';','/'): ""}</Typography>
                    </Box>
                </Box>
            </Col>
            {/* <Col>
                
            </Col> */}
            
            {/* <Col xs="auto">
                <Button type="button"  className="float-end"
                    variant="outline-danger" 
                    onClick={ e => {e.preventDefault(); actionDeleteSubjectItem({psi_id : el.psi_id})} }
                    > 
                    <i className="bi bi-trash3"></i> 
                </Button>
            </Col> */}
        </Row>
        </ListGroup.Item>
    )

    return (
        <>
        <SubjectItemModalForm 
            show={showModalSubjectItemModalForm} 
            callBack={actionCallBackSubjectItemModalForm} />
        <SubjectTaskModalList 
            show={showSubjectTaskModalList} 
            callBack={actionCallBackModalTaskList}
        />
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
                    {url:``, name: Project.project?.project_name?.trim()}
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
            <Col sm="auto">
            <InputGroup>
                <Button type="button" variant="" onClick={actionCallModalItemCreate} >
                    <i className="bi bi-plus-circle"></i>
                </Button>
                {/* <Button type="button" variant="" onClick={actionCallFilter} >
                    <i className="bi bi-filter"></i>
                    <span className="position-absolute top-0 start-55 translate-right badge rounded-pill bg-danger">
                        {filterCount?filterCount:""}
                    </span>
                </Button> */}
            </InputGroup>
            </Col>
            <Col style={{margin: "auto"}}>
                <Chip
                    label="Активные"
                    color={status=='1'?"primary":"default"}
                    onClick={(e) => {
                        onChangeUrl({limit: "", offset : 0, status : status == '1'? "" : '1'})
                    }}
                    variant={status=='1'?"filled":"outlined"}
                />
                &nbsp;
                <Chip
                    label="Архивные"
                    color={status=='2'?"primary":"default"}
                    onClick={(e) => {
                        onChangeUrl({limit: "", offset : 0, status : status == '2'? "" : '2'})
                    }}
                    variant={status=='2'?"filled":"outlined"}
                />   
                </Col>
        </Row>
        <Row  style={{marginTop : "8px"}}>
            <Col>
                <ListGroup>
                    {projectSubjectItems}
                    </ListGroup>
            </Col>
        </Row>
        <Row style={{marginBottom: "32px"}}>
            <Col>
            <br/><br/>
                {offset!=0?
                <a href="#" onClick={paginateBackward} style={{fontSize:"1.6em"}}>
                    <i className="bi bi-arrow-left-circle"></i>
                </a>:""
                }
                &nbsp;
                {Project.project_subject_item_list.length == limit ? 
                <a href="#" onClick={paginateForward} style={{fontSize:"1.6em"}}>
                    <i className="bi bi-arrow-right-circle"></i>
                </a> : ""
                }
            </Col>
        </Row>
        </Container>
        </>
   )
}


export default SubjectItemList;
