import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment-timezone';
import { getTask, postTask, getProject } from '../../network/TaskNetwork';
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

    // const saveTask = () => {
    //     console.log(task_title, task_note, status_id, executor_id, responsible_id, reviewer_id);
    // }

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
                                height="400px"
                                placeholder="Описание задачи"
                                defaultValue={Project.task.task_note}
                                callBack={(value) => {saveTask({task_note : value})}}
                            />
                        </Form.Group>
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
                                options={
                                    Project.project.project_user_list.map(user => {
                                            return {value : user.user_id, label : user.login}
                                })}
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
                                defaultDisplay={Project.task.ru_responsible_login?Project.task.ru_responsible_login:"Не указан"}
                                options={
                                    Project.project.project_user_list.map(user => {
                                            return {value : user.user_id, label : user.login}
                                })}
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
                                defaultDisplay={Project.task.ru_reviewer_login?Project.task.ru_reviewer_login:"Не указан"}
                                options={
                                    Project.project.project_user_list.map(user => {
                                            return {value : user.user_id, label : user.login}
                                })}
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
                                defaultDisplay={Project.task.status_name?Project.task.status_name:"Не указан"}
                                options={
                                    Project.project.project_status_list.map(status => {
                                            return {value : status.status_id, label : status.status_name}
                                })}
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