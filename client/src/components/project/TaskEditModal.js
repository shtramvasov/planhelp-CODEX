import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TaskForm from './TaskForm';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

/**
 * Компонент описывающий редактирование задачи
 * @param {*} props 
 * @returns 
 */
function TaskEditModal(props) {

    const {project_id, task_id} = props;

    const closeMe = () => {
        props.callBack();
    }

    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} dialogClassName="modal-90w">
            {/* <form onSubmit={() => {alert("submit")}}> */}
                <Modal.Header closeButton={true}>
                    <Modal.Title>Задача #{task_id}</Modal.Title>
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