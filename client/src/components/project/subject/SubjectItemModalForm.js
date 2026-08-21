import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Container, Row, Col, Form, Button, ListGroup, Table, Badge, Dropdown, DropdownButton, InputGroup, Collapse } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { addProjectSubject, addProjectSubjectItem } from '../../../reducers/Project';
import Select from 'react-select';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function SubjectItemModalForm(props) {
    
    const dispatch = useDispatch();
    const project = useSelector((state) => state.project);
    const project_subject = useSelector((state) => state.project.project_subject);
    const project_subject_item = useSelector((state) => state.project.project_subject_item);
    const psi_status_list = [
        { value : 1, label : "Активен"},
        { value : 2, label : "В архиве"}
    ];

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        props.callBack(1);
    }

    const onFormChange = (e) => {
        // console.log(project_subject_item);
        const new_psi = {...project_subject_item};
        new_psi[e.target.id] = e.target.value;
        dispatch(addProjectSubjectItem({
            ...new_psi
        }));
    }

    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} dialogClassName="modal-90w">
        <form onSubmit={saveMe}>
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    {project_subject_item.psi_id ? 
                        `Изменить ${project_subject.subject_name}`
                        : `Создать ${project_subject.subject_name}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Label>Название</Form.Label>
                <Form.Group className="mb-3" controlId="psi_name">
                    <Form.Control
                        defaultValue={project_subject_item.psi_name}
                        placeholder="Укажите название"
                        onChange={onFormChange}
                        autoFocus/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="psi_note">
                <Form.Control
                    type="text"
                    as="textarea"
                    rows={6}
                    // need for not rerender!!
                    value={project_subject_item.psi_note}
                    // 
                    defaultValue={project_subject_item.psi_note}
                    onChange={onFormChange}
                    placeholder={"Укажите описание"}
                />
                </Form.Group>
                <Form.Label>Период</Form.Label>
                <InputGroup>
                        <Form.Group className="mb-3">
                            <DatePicker 
                                wrapperClassName="datePicker phDatePicker" 
                                placeholderText="ДД.ММ.ГГГГ"
                                selected={project_subject_item.date_start ? Date.parse(project_subject_item.date_start): null}
                                onChange={(date) => {
                                    const e = {target:{id : "date_start", value : date ? date.toISOString():null}};
                                    onFormChange(e);
                                }}
                                dateFormat="d.MM.yyyy"/>
                        </Form.Group>
                        <div style={{paddingTop: "6px",paddingBottom: "6px"}}>&nbsp;&mdash;&nbsp;</div>
                        <Form.Group className="mb-3">
                            <DatePicker 
                                wrapperClassName="datePicker phDatePicker" 
                                placeholderText="ДД.ММ.ГГГГ"
                                selected={project_subject_item.date_end ? Date.parse(project_subject_item.date_end): null}
                                onChange={(date) => {
                                    const e = {target:{id : "date_end", value : date ? date.toISOString():null}};
                                    onFormChange(e);
                                }}
                                dateFormat="d.MM.yyyy"/>
                        </Form.Group>
                    </InputGroup>
                <Form.Label>Статус</Form.Label>
                <Form.Group className="mb-3">
                    <Select 
                        // isMulti 
                        closeMenuOnSelect={true} 
                        onChange={(option) => {
                            const e = {target:{id : "status", value : option.value}};
                            onFormChange(e);
                        }}
                        //defaultValue={psi_status_list.filter((option) => option.value == project_subject_item.status)}
                        value={psi_status_list.filter((option) => option.value == project_subject_item.status)}
                        placeholder="Тип" 
                        options={psi_status_list}
                    />
                </Form.Group>           
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeMe}>
                    Закрыть
                </Button>
                <Button variant="outline-primary" type="submit">
                    Сохранить
                </Button>
            </Modal.Footer>    
        </form>
        </Modal>
        </div>
    );
}


export default SubjectItemModalForm;