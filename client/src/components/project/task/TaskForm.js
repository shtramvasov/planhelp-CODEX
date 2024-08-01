import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import {Row, Col, Badge} from 'react-bootstrap';
import moment from 'moment-timezone';
import { getTask, postTask, getProject, postTaskCommonNote, postTaskTags } from '../../../network/TaskNetwork';
import { getSprintList } from '../../../network/SprintNetwork';
import { addTask, addSprintList } from '../../../reducers/Project';
import { Link, useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import LinkInput from '../../helpers/LinkInput';
import ToastMessage from "../../helpers/ToastMessage";
import DragDropFile from "../../helpers/DragDropFile";

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
        // fetchSprintList();
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

    // const fetchSprintList = () => {
    //     getSprintList({ project_id, status : 0 }, (err,resp) => {
    //         dispatch(addSprintList(resp))
    //     })
    // }

    const saveTask = ({task_title, task_note, status_id, executor_id, responsible_id, reviewer_id, sprint_id}) => {
        postTask({ project_id, task_id, 
            task_title, task_note, status_id, executor_id, responsible_id, reviewer_id, sprint_id
        }, (err,resp) => {
            if (!err) {
                fetchTask();
            } else {
                alert("Ошибка: "+err);
            }
        })    
    }

    const submitTags = (tags) => {
        postTaskTags({project_id : project_id, task_id : task_id, tags : tags}, (err,resp) => {
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
                note : value,
                note_type : "COMMENT"
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

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        if (!file) {
            return;
        }

        postTaskCommonNote(
            {
                project_id, 
                task_id, 
                note : file.name,
                note_2 : file.url,
                note_type : "FILE"
            }
            ,(err,resp) => {
                if (!err) {
                    fetchTask();
                } else {
                    alert("Ошибка: "+err);
                }
        })
    }

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });
    // мапированный массив тэгов проекта
    const tagSelectOptions = Project.project.project_tag_list.map(tag => {
        return {value : tag.tag_id, label : tag.tag}
    });
    // мапированный массив открытых спринтов
    const sprintSelectOptions = Project.project.project_open_sprints.map(sprint => {
        return {
            value : sprint.sprint_id, 
            label : `${moment(sprint.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM')} - ${moment(sprint.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM(YYYY)')}`}
    });
    // мапированный массив пользователей
    const userSelectOptions = Project.project.project_user_list.map(user => {
        return {value : user.user_id, label : user.login}
    });
    // дефолтное значение статуса
    const statusSelectOptionsDefault = statusSelectOptions.filter(status => status.value == Project.task.status_id)[0];
    const executorSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.executor_id)[0];
    const responsibleSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.responsible_id)[0];
    const reviewerSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.reviewer_id)[0];
    const sprintSelectOptionsDefault = sprintSelectOptions.filter(sprint => sprint.value == Project.task.sprint_id)[0];

    // список комментов
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
    // список файлов
    const fileItems = Project.task?.files.map((comment, index) => {
        return <div key={index}>
            <div>
                <small>
                    <a target="_blank" className="phLink" href={comment.note_2}>{comment.note}</a>
                </small>
                {/* <small>{comment.note}</small> */}
            </div>
            <div style={{textAlign: "right"}}>
                <small style={{fontWeight: "300"}}>{comment.login} {moment(comment.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}</small>
            </div>
            <hr/>
        </div>
    });
    // список тэгов
    const tagList = Project.task.tags.map((el) =>
        <div style={{display: "inline", paddingRight: "6px"}}>
            <Badge bg="secondary"> 
                {el.tag}
            </Badge>
        </div>
    );
    const FilesContainer = () => {
        return(
            <>
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
            </>
        )
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
                    <Col style={{wordWrap: "break-word"}}>
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
                {/* Файлы */}
                <Row>
                    <Col>
                        <small><b>Файлы</b></small>&nbsp;
                        <Badge bg="secondary">{fileItems.length}</Badge>
                        <hr/>
                        {fileItems}
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
                <DragDropFile files = { <FilesContainer /> } callBack= {actionUploadFileCallBack}  />
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
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Спринт</small>
                        </div>
                        <div>
                        <LinkInput 
                                type="selectList"
                                placeholder="Спринт"
                                value={sprintSelectOptionsDefault}
                                defaultDisplay={Project.task.sprint_id?
                                    `${moment(Project.task.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM')} - ${moment(Project.task.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('DD.MM(YYYY)')}`
                                    :"Не указан"}
                                options={sprintSelectOptions}
                                callBack={(value, label) => {saveTask({sprint_id : value})}}
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
                <Row style={{marginTop: "32px"}}>
                    <Col>
                        <div>
                            <small>Тэги</small>
                        </div>
                        <div>
                            <LinkInput
                                type="tagList"
                                placeholder="Тэг"
                                // defaultValues={Project.task.tags}
                                options={tagSelectOptions}
                                value={Project.task.tags.map(tag => {
                                    return {value : tag.tag_id, label : tag.tag}
                                })}
                                callBack={(options) => {
                                    const tags = options.map((option) => {
                                        return {
                                            tag_id : option.value,
                                            tag : option.label
                                        }
                                    })
                                    submitTags(tags);
                                }}
                            />
                            {/* {tagList} */}
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default TaskForm;