import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { getNotifyList, readAllNotify } from '../../network/NotifyNetwork';
import { addNotifyList } from '../../reducers/Notify';
import ListGroup from 'react-bootstrap/ListGroup';
import moment from 'moment';
import 'moment/locale/ru';
moment.locale('ru');

function NotifyList(props) {
    const [ searchParams ] = useSearchParams();
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset")?searchParams.get("offset"):0;
    const dispatch = useDispatch()
    const Notify = useSelector((state) => state.notify);
    const navigate = useNavigate();

    const fetchNotifyList = () => {
        getNotifyList({limit:limit?limit:"", offset:offset?offset:""}, (err,resp) => {
            if (!err) {
                dispatch(addNotifyList(resp));    
            } else {
                alert("Ошибка: "+err);
            }
        });
    }

    const paginateForward = () => {
        navigate(`/notify?limit=50&offset=${parseInt(offset?offset:0)+50}`);
    }

    const paginateBackward = () => {
        navigate(`/notify?limit=50&offset=${parseInt(offset)-50}`);
    }

    const actionReadAllNotify = () => {
        readAllNotify({},(err,resp) => {
            if (!err) {
                fetchNotifyList();
            } else {
                alert("Ошибка: "+err);
            }
        })
    }

    const actionProcessNotify = (e,notify) => {
        e.preventDefault();
        if (notify.object_type === "disk_entity") navigate(`/disk/${notify.object_id}`); else
        if (notify.object_type === "project_task") navigate(`/project/${notify.project_id}/task/${notify.object_id}`); 

    }

    useEffect(() => {
        fetchNotifyList();
    },[offset]);
    
    const listItems = Notify.notifyList.map((el) =>
    <ListGroup.Item key={el.notify_id} style={{border:"0"}}>
        <div>
            <small style={{fontSize : "0.6em"}}>{moment(el.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
        </div>
        <div>
            {!el.is_read?<strong>{el.notify_note}</strong>:el.notify_note}
        </div>
        {el.object_id?
        <div>
            <a href="#" onClick={(e)=>{actionProcessNotify(e,el)}} style={{fontSize:"1.6em"}}>
                <i className="bi bi-arrow-up-right-square"></i>
            </a>
        </div>:""
        }
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
            <a href="#" onClick={actionReadAllNotify} className="phLink">Отметить все прочитанными</a>
            <br/>
            <br/>
        </Col>
    </Row>
    <Row>
        <Col>
            <ListGroup >{listItems}</ListGroup>
        </Col>
    </Row>

    <Row>
        <Col>
        <br/><br/>
            {offset!=0?
            <a href="#" onClick={paginateBackward} style={{fontSize:"1.6em"}}>
                <i className="bi bi-arrow-left-circle"></i>
            </a>:""
            }
            &nbsp;
            <a href="#" onClick={paginateForward} style={{fontSize:"1.6em"}}>
                <i className="bi bi-arrow-right-circle"></i>
            </a>
        </Col>
    </Row>
    </Container>
    );
}


export default NotifyList;