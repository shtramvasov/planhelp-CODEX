import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import TaskForm from './TaskForm';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import 'moment/locale/ru';
moment.locale('ru');

/**
 * Компонент описывающий редактирование задачи
 * @param {*} props 
 * day - день "2024-07-01" например
 * @returns 
 */
function DayDetail(props) {


    const getFontBgColor = (variant) =>{
        switch(variant) {
            case "primary" : return "bg-primary text-white"
            case "secondary" : return "bg-secondary text-white"
            case "success" : return "bg-success text-white"
            case "danger" : return "bg-danger text-white"
            case "warning" : return "bg-warning"
            case "info" : return "bg-info"
            case "light" : return "bg-light"
            case "dark" : return "bg-dark text-white"
            default:
                return ""
        }
    }

    const Note = useSelector((state) => state.note);

    const closeMe = () => {
        props.callBack();
    }

    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} dialogClassName="modal-90w">
            {/* <form onSubmit={() => {alert("submit")}}> */}
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                    {moment(props.day).format('LL')}
                    {/* <span style={{fontSize: "0.8em"}}>
                        Задача #{task_id}&nbsp;
                        <span style={{fontWeight: "200", fontSize: "0.8em"}}>
                            создана {moment(Project.task.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')} ({Project.task.ru_created_login})
                            {Project.task.closed_on?", закрыта " + moment(Project.task.closed_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL') : ""}
                        </span>
                    </span> */}
                    </Modal.Title>
                    &nbsp;&nbsp;<i style={{cursor: "pointer"}} className="bi bi-plus-circle" onClick={(e)=>{props.onCreateNote(e,new Date(props.day+"T00:00:00"))}}></i>
                </Modal.Header>
                <Modal.Body>
                    {
                        Note.noteList[props.day]?.map((note) => {
                            return <div key={note.note_id}
                                onClick={(e)=>props.onEditNote(e,note)}
                                className={getFontBgColor(note.variant)}
                                style={{
                                        padding: "8px", 
                                        marginBottom: "4px",
                                        fontWeight:"300",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}>
                                    {moment(note.remind_on).format("HH:mm")}
                                    &nbsp;
                                    {note.note}
                            </div>;
                        })
                    }
                </Modal.Body>
                {/* <Modal.Footer>
                </Modal.Footer> */}
            {/* </form> */}
        </Modal>
        </div>
    );
}


export default DayDetail;