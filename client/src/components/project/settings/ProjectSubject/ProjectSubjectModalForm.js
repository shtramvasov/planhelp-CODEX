import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { addProject, addProjectSubject } from '../../../../reducers/Project';
import Select from 'react-select';

function ProjectSubjectModalForm(props) {
    
    const dispatch = useDispatch();
    const project = useSelector((state) => state.project);
    const project_subject = useSelector((state) => state.project.project_subject);
    const subject_type_list = [{value : "LOV", label : "Список"},{value : "TEXT", label : "Текст"}];

    const closeMe = () => {
        props.callBack();
    }

    const saveMe = (e) => {
        e.preventDefault();
        props.callBack(1);
    }

    const setSubjectType = (option) => {
        dispatch(addProjectSubject({
            ...project_subject, subject_type : option.value
        }));
    }
    const onFormChange = (e) => {
        const new_project_subject = {...project_subject};
        new_project_subject[e.target.id] = e.target.value;
        dispatch(addProjectSubject({
            ...new_project_subject
        }));
    }

    return (
    <Modal show={props.show} onHide={closeMe}>
    <form onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>Сущность</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3" controlId="subject_name">
                <Form.Control
                    defaultValue={project_subject.subject_name}
                    placeholder="Укажите название сущности"
                    onChange={onFormChange}
                    autoFocus/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Select 
                    // isMulti 
                    closeMenuOnSelect={true} 
                    onChange={(option) => {
                        setSubjectType(option);
                    }}
                    defaultValue={subject_type_list.filter((option) => option.value == project_subject.subject_type)}
                    placeholder="Тип" 
                    options={subject_type_list}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Check 
                    type="switch"
                    id="display_variant"
                    label={project_subject.display_variant===1?"Видят только владельцы проекта":"Видят все пользователи проекта"}
                    onChange={(event) => {
                        const e = {target : { id : event.target.id, value : event.target.checked?1:0 }}
                        onFormChange(e)
                    }}
                    checked={project_subject.display_variant===1?true:false}
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
    );
}


export default ProjectSubjectModalForm;