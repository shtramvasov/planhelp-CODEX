import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TaskForm from './TaskForm';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import 'moment/locale/ru';
moment.locale('ru');

/**
 * Компонент описывающий редактирование задачи
 * @param {*} props 
 * @returns 
 */
function TaskEditModal(props) {

    const {project_id, task_id} = props;
    const Project = useSelector((state) => state.project);

    const closeMe = () => {
        props.callBack();
    }

    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} fullscreen={true}>
            {/* <form onSubmit={() => {alert("submit")}}> */}
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                    <span style={{fontSize: "0.8em"}}>
                        Задача #{task_id}&nbsp;
                        <span style={{fontWeight: "200", fontSize: "0.8em"}}>
                            создана {moment(Project.task.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')} ({Project.task.ru_created_login})
                            {Project.task.closed_on?", закрыта " + moment(Project.task.closed_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL') : ""}
                        </span>
                    </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <TaskForm project_id={project_id} task_id={task_id}/>
                </Modal.Body>
                {/* <Modal.Footer>
                </Modal.Footer> */}
            {/* </form> */}
        </Modal>
        </div>
    );
}


export default TaskEditModal;