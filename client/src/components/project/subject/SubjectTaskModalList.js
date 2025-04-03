import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup, Collapse } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { addProjectSubject, addProjectSubjectItem } from '../../../reducers/Project';
import Select from 'react-select';
import moment from 'moment-timezone';
import TaskListMode from "../task/TaskListMode";
import 'moment/locale/ru';
moment.locale('ru');


function SubjectTaskModalList(props) {
    
    const dispatch = useDispatch();
    const project_subject_item = useSelector((state) => state.project.project_subject_item);
    // const project = useSelector((state) => state.project);
    // const project_subject = useSelector((state) => state.project.project_subject);
    // const project_subject_item = useSelector((state) => state.project.project_subject_item);
    // const psi_status_list = [
    //     { value : 1, label : "Активен"},
    //     { value : 2, label : "В архиве"}
    // ];

    const closeMe = () => {
        props.callBack();
    }

    // const saveMe = (e) => {
    //     e.preventDefault();
    //     props.callBack(1);
    // }

    // const onFormChange = (e) => {
    //     // console.log(project_subject_item);
    //     const new_psi = {...project_subject_item};
    //     new_psi[e.target.id] = e.target.value;
    //     dispatch(addProjectSubjectItem({
    //         ...new_psi
    //     }));
    // }

    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} dialogClassName="modal-90w">
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    {project_subject_item.psi_name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <TaskListMode actionCallModaTaskEdit={()=>{console.log('not implemented')}}/>
            </Modal.Body>
            {/* <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeMe}>
                    Закрыть
                </Button>
                <Button variant="outline-primary" type="submit">
                    Сохранить
                </Button>
            </Modal.Footer>     */}
        </Modal>
        </div>
    );
}


export default SubjectTaskModalList;