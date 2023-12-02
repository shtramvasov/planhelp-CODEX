import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import {Row, Col, Badge} from 'react-bootstrap';
import moment from 'moment-timezone';
import { getTask, postTask, getProject, postTaskCommonNote } from '../../network/TaskNetwork';
import { addTask } from '../../reducers/Project';
import { Link, useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import LinkInput from '../helpers/LinkInput';

import 'moment/locale/ru';
moment.locale('ru');

/**
 * Форма, для редактирования задачи
 * вызывается либо в компоненте TaskProjectTaskForm
 *            либо в модалке для быстрого доступа из TaskProjectList
 * @param {*} props 
 * @returns 
 */

function TaskForm(props) {
    
    const [isEdit, setIsEdit] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, task_id } = props;

    const Project = useSelector((state) => state.project);
    
    // Первичная загрузка данных
    useEffect(() => {
        fetchTask();
    },[]);

    const fetchTask = () => {
        getTask({project_id, task_id},(err,resp) => {
            if (!err) {
                dispatch(addTask(resp));
            } else {
                alert("Ошибка: "+err);
            }
        });
    };

    const saveTask = ({task_title, task_note, status_id, executor_id, responsible_id, reviewer_id}) => {
        postTask({ project_id, task_id, 
            task_title, task_note, status_id, executor_id, responsible_id, reviewer_id
        }, (err,resp) => {
            if (!err) {
                fetchTask();
            } else {
                alert("Ошибка: "+err);
            }
        })    
    }

    const submitComment = (value) => {
        // e.preventDefault();
        if (!value.trim()) {
            return;
        }
        postTaskCommonNote(
            {
                project_id, 
                task_id, 
                note : value
            }
            ,(err,resp) => {
                if (!err) {
                    fetchTask();
                    // e.target.taskCommonNote.value = "";
                } else {
                    alert("Ошибка: "+err);
                }
            })
    }

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });
    // дефолтное значение статуса
    const statusSelectOptionsDefault = statusSelectOptions.filter(status => status.value == Project.task.status_id)[0];
    // мапированный массив пользователей
    const userSelectOptions = Project.project.project_user_list.map(user => {
        return {value : user.user_id, label : user.login}
    });
    const executorSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.executor_id)[0];
    const responsibleSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.responsible_id)[0];
    const reviewerSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.reviewer_id)[0];
    
    const commentItems = Project.task?.comments.map((comment, index) => {
        return <div key={index}>
            <div>
                <small>
                <LinkInput
                    type="markDown"
                    placeholder="Ваш комментарий"
                    submitLabel="Комментировать"
                    isEditable={false}
                    defaultValue={comment.note}
                    callBack={(value) => {
                        submitComment(value);
                    }}
                />
                </small>
                {/* <small>{comment.note}</small> */}
            </div>
            <div style={{textAlign: "right"}}>
                <small style={{fontWeight: "300"}}>{comment.login} {moment(comment.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
            </div>
            <hr/>
        </div>
    });

    return (
    
        <Row>
            <Col sm={12} lg={10}>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="modalText">
                            <LinkInput
                                type="headerField"
                                placeholder="Заголовок задачи"
                                defaultValue={Project.task.task_title}
                                callBack={(value) => {saveTask({task_title : value})}}
                             />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="modalText">
                            <LinkInput
                                type="markDown"
                                height="300px"
                                placeholder="Описание задачи"
                                defaultValue={Project.task.task_note}
                                callBack={(value) => {saveTask({task_note : value})}}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                {/* Комменты */}
                <Row>
                    <Col>
                        <small><b>Комментарии</b></small>&nbsp;
                        <Badge bg="secondary">{commentItems.length}</Badge>
                        <hr/>
                        {commentItems}
                    </Col>
                </Row>
                {/* Форма добавления коммента */}
                <Row>
                    <Col>
                        {/* <form onSubmit={submitComment}> */}
                        <Row>
                            <Col>
                            <Form.Group className="mb-3" controlId="taskCommonNote">
                                <LinkInput
                                    type="markDown"
                                    height="200px"
                                    placeholder="Ваш комментарий"
                                    isEdit={true}
                                    isCancel={false}
                                    submitLabel="Комментировать"
                                    callBack={(value) => {
                                        submitComment(value);
                                    }}
                                />
                            </Form.Group>
                            </Col>
                        </Row>
                        {/* </form> */}
                    </Col>
                </Row>
            </Col>
            <Col>
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Исполнитель</small>
                        </div>
                        <div>
                            <LinkInput 
                                type="selectList"
                                placeholder="Исполнитель"
                                defaultDisplay={Project.task.ru_executor_login?Project.task.ru_executor_login:"Не указан"}
                                value={executorSelectOptionsDefault}
                                options={userSelectOptions}
                                callBack={(value, label) => {saveTask({executor_id : value})}}
                                />
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Ответственный</small>
                        </div>
                        <div>
                        <LinkInput 
                                type="selectList"
                                placeholder="Ответственный"
                                value={responsibleSelectOptionsDefault}
                                defaultDisplay={Project.task.ru_responsible_login?Project.task.ru_responsible_login:"Не указан"}
                                options={userSelectOptions}
                                callBack={(value, label) => {saveTask({responsible_id : value})}}
                                />
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Ревьювер</small>
                        </div>
                        <div>
                        <LinkInput 
                                type="selectList"
                                placeholder="Ревьювер"
                                value={reviewerSelectOptionsDefault}
                                defaultDisplay={Project.task.ru_reviewer_login?Project.task.ru_reviewer_login:"Не указан"}
                                options={userSelectOptions}
                                callBack={(value, label) => {saveTask({reviewer_id : value})}}
                                />
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "32px"}}>
                    <Col>
                        <div>
                            <small>Статус</small>
                        </div>
                        <div>
                        <LinkInput 
                                type="selectList"
                                placeholder="Статус"
                                value={statusSelectOptionsDefault}
                                defaultDisplay={Project.task.status_name?Project.task.status_name:"Не указан"}
                                options={statusSelectOptions}
                                callBack={(value, label) => {saveTask({status_id : value})}}
                                />
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default TaskForm;