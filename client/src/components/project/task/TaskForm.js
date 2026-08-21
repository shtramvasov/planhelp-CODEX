import React, { useState , useEffect, useRef} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Row, Col, Badge, Alert, Accordion} from 'react-bootstrap';
import moment from 'moment-timezone';
import  { getTask, postTask, postTaskCommonNote, postTaskTags, 
            postProjectTaskTimelineStart, postProjectTaskTimelineEnd, 
            deleteProjectTaskTimeline, postProjectTaskTimeline
        } from '../../../network/TaskNetwork';
import { addTask, addPtt } from '../../../reducers/Project';
import { Link, useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import LinkInput from '../../helpers/LinkInput';
import PttModal from "./PttModal";
import ModalInputFile from "../../helpers/ModalInputFile";
import DragDropFile from "../../helpers/DragDropFile";
import { addPositiveMessage, addNegativeMessage } from '../../../reducers/App';
import { addProjectSubjectItemList } from '../../../reducers/Project';
import { messages } from "../../constants/Msg";
import { getProjectSubjectItemList } from '../../../network/ProjectSubject';
import Dropdown from 'react-bootstrap/Dropdown';

import 'moment/locale/ru';
moment.locale('ru');

/**
 * Форма, для редактирования задачи
 * вызывается либо в компоненте TaskProjectTaskForm
 *            либо в модалке для быстрого доступа из TaskProjectList
 * @param {*} props 
 * @returns 
 */

const FilesContainer = (props) => {
    return(
        <>
            {/* Форма добавления коммента */}
            <Row style={{marginTop:"6px"}}>
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
                                callBack={props.callBack}
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

function TaskForm(props) {
    
    const [showModalPttEdit, setShowModalPttEdit] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);

    const [ searchParams ] = useSearchParams();
    const note_id = searchParams.get("note_id"); 

    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, task_id } = props;

    const User = useSelector((state) => state.user);
    const Project = useSelector((state) => state.project);

    const scrollContainerRef = useRef(null);
    const itemRefs = useRef({});


    const scrollToItem = (id) => {
        if (itemRefs.current[id]) {
          itemRefs.current[id].scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      };

    // Первичная загрузка данных
    useEffect(() => {
        fetchTask();
    },[]);

    useEffect(() => {
        if (note_id) {
            setTimeout(() => {scrollToItem(note_id)}, 2000);
        }
    },[note_id,Object.keys(itemRefs.current).length,Project.task?.comments]);

    const fetchTask = () => {
        getTask({project_id, task_id},(err,resp) => {
            if (!err) {
                dispatch(addTask(resp));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    };

    // Список psi
    const fetchProjectSubjectItems = ({project_id, subject_id}) => {
        dispatch(addProjectSubjectItemList([]));
        getProjectSubjectItemList({project_id, subject_id, limit : 1000, offset : 0, status : 1}, (err,resp) => {
            if (!err) {
                dispatch(addProjectSubjectItemList(resp));
            } else {
                dispatch(addNegativeMessage(messages.FETCH_FAIL));
            }
        });
    };

    const saveTask = ({task_title, task_note, status_id, executor_id, responsible_id, reviewer_id, psi_list}) => {
        postTask({ project_id, task_id, 
            task_title, task_note, status_id, executor_id, responsible_id, reviewer_id, psi_list
        }, (err,resp) => {
            if (!err) {
                fetchTask();
            } else {
                dispatch(addNegativeMessage(err));
            }
        })    
    }

    const submitTags = (tags) => {
        postTaskTags({project_id : project_id, task_id : task_id, tags : tags}, (err,resp) => {
            if (!err) {
                fetchTask();
            } else {
                dispatch(addNegativeMessage(err));
            }
        })

    }

    const startPtt = () => {
        postProjectTaskTimelineStart({project_id : project_id, task_id : task_id}, (err,resp) => {
            if (!err) {
                fetchTask();
                dispatch(addPositiveMessage("Вы начали работу над задачей"));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    }
    const stopPtt = () => {
        postProjectTaskTimelineEnd({project_id : project_id, task_id : task_id}, (err,resp) => {
            if (!err) {
                fetchTask();
                dispatch(addPositiveMessage("Вы остановили работу над задачей"));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    }

    const submitComment = ({variant, value, note_id}) => {
        // alert(variant);
        // e.preventDefault();
        // if (!value?.trim() || !variant) {
        //     return;
        // }
        postTaskCommonNote(
            {
                project_id, 
                task_id, 
                note : value,
                note_id : note_id,
                note_type : "COMMENT",
                variant
            }
            ,(err,resp) => {
                if (!err) {
                    fetchTask();
                    // e.target.taskCommonNote.value = "";
                } else {
                    dispatch(addNegativeMessage(err));
                }
            })
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        setShowModalUploadFile(false);
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
                    dispatch(addPositiveMessage(messages.SUCCESS));
                } else {
                    dispatch(addNegativeMessage(err));
                }
        })
    }

    const actionCallPtt = (e, timeline) => {
        e.preventDefault();
        dispatch(addPtt(timeline ? timeline : { 
            user_id : User.profile.user_id,
            login : User.profile.login
         }))
        setShowModalPttEdit(true);
    }

    // колбэк после изменения времени
    const actionCallModaPttCallback = (ptt) => {
        if (ptt) {
            postProjectTaskTimeline({
                user_id : ptt.user_id,
                date_start : ptt.date_start,
                date_end : ptt.date_end,
                ptt_id : ptt.ptt_id,
                project_id : project_id,
                task_id : task_id
            },(err,resp) => {
                    if (!err) {
                        dispatch(addPositiveMessage(messages.SUCCESS));
                        fetchTask();
                    } else {
                        dispatch(addNegativeMessage(err));
                    }
                }
            )
        }
        setShowModalPttEdit(false);
    }

    // Функция для прокрутки вверх
    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // Функция для прокрутки вниз
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const actionCallModaPttDeleteCallback = (ptt) => {
        deleteProjectTaskTimeline({project_id : project_id, task_id : task_id, ptt_id : ptt.ptt_id}, (err,resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchTask();
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
        setShowModalPttEdit(false);
    }

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });
    // мапированный массив тэгов проекта
    const tagSelectOptions = Project.project.project_tag_list.map(tag => {
        return {value : tag.tag_id, label : tag.tag}
    });
    
    // мапированный массив пользователей
    const userSelectOptions = Project.project.project_user_list.map(user => {
        return {value : user.user_id, label : user.login}
    });

    // мапированный массив кликнутого subject
    const psiSelectOptions = Project.project_subject_item_list.map(psi => {
        return {value : psi.psi_id, label : psi.psi_name}
    });

    // дефолтное значение статуса
    const statusSelectOptionsDefault = statusSelectOptions.filter(status => status.value == Project.task.status_id)[0];
    const executorSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.executor_id)[0];
    const responsibleSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.responsible_id)[0];
    const reviewerSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.task.reviewer_id)[0];
    // const psiSelectOptionsDefault = psiSelectOptions.filter(psi => {
    //     return Project.task.psi_list.filter((task_psi) => task_psi.psi_id == psi.value)
    //     // psi.value == Project.task.psi_list.find
    // })

    // список комментов
    const commentItems = Project.task?.comments.map((comment, index) => {
        return <div key={index} ref={(el) => itemRefs.current[comment?.note_id] = el} >
            <div style={{padding: "6px"}} className={comment.variant?`border rounded border-2 border-${comment.variant}`:""}>
                <div style={{marginBottom: "8px"}}>
                    <a onClick={(e) => {
                            e.preventDefault(); 
                            // navigate(`/project/${project_id}/board?open_modal_task_id=${task_id}&note_id=${comment.note_id}`);
                            scrollToItem(comment.note_id)
                        }}
                        href={`/project/${project_id}/board?open_modal_task_id=${task_id}&note_id=${comment.note_id}`} 
                        style={{textDecoration : "none", color: "#555"}}>
                        <small style={{ fontSize:"0.8em"}}>
                            #{comment.note_id} <b>{comment.login}</b> {moment(comment.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}
                        </small>
                    </a>
                    <div style={{float: "right"}}>
                        <Dropdown>
                            <Dropdown.Toggle variant="" className="replace_arrow">
                                <small><i className="bi bi-three-dots-vertical"></i></small>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                            <Dropdown.Item href="#" onClick={() => submitComment({variant : "", note_id: comment.note_id})}>Обычный</Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => submitComment({variant : "success", note_id: comment.note_id})}>Зеленый</Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => submitComment({variant : "warning", note_id: comment.note_id})}>Оранжевый</Dropdown.Item>
                                <Dropdown.Item href="#" onClick={() => submitComment({variant : "danger", note_id: comment.note_id})}>Красный</Dropdown.Item>
                                {/* <Dropdown.Item href="#" onClick={() => submitComment({variant : "", note_id: comment.note_id})}>Скрытый</Dropdown.Item> */}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
                <div>
                    
                </div>
                <div>
                    <small>
                        <LinkInput
                            type="markDown"
                            placeholder="Ваш комментарий"
                            submitLabel="Комментировать"
                            // isEditable={false}
                            additional={{...comment}}
                            defaultValue={comment.note}
                            callBack={(value,additional) => {
                                submitComment({value, note_id: additional.note_id});
                            }}
                        />
                    </small>
                </div>
            </div>
            {( Project.task?.comments.length !== index+1 ? <hr/> : "" )}
        </div>
    });
    // список файлов
    const fileItems = Project.task?.files.map((comment, index) => {
        return <div key={index}>
            <div style={{marginBottom: "8px"}}>
                <small style={{ fontSize:"0.8em"}}>
                    <b>{comment.login}</b> {moment(comment.created_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').fromNow()}
                </small>
            </div>
            <div>
                <small>
                    <a target="_blank" className="phLink" href={comment.note_2}>{comment.note}</a>
                </small>
                {/* <small>{comment.note}</small> */}
            </div>
            {( Project.task?.files.length !== index+1 ? <hr/> : "" )}
        </div>
    });
    // список временной таблицы
    const timetableItems = Project.task?.timetable.map((timeline, index) => {
        return <div key={index}>
            <div style={{marginBottom: "8px"}}>
                <small style={{ fontSize:"0.8em"}}>
                    <b>{timeline.login}</b>&nbsp;
                    {moment(timeline.date_start,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}
                    &nbsp;&mdash;&nbsp;
                    {timeline.date_end ? 
                        moment(timeline.date_end,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL') 
                        : "дата и время окончания еще не указана"}
                </small>
                &nbsp;
                {Project.project.user_role === "OWNER" || timeline.login === User.profile.login?
                    <small>
                        <a className="phLink" style={{fontSize:"0.8em"}} href="#" onClick={(e)=>{actionCallPtt(e,timeline)}}>изменить</a>
                    </small>
                    : ""
                }

            </div>
            {( Project.task?.timetable.length !== index+1 ? <hr/> : "" )}
            
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

    const projectSubjectItems = Project.project.project_subject_list.map((subject) => {

        const getPsiDisplayValue = (subject_id) => {
            const task_psi = Project.task?.psi_list.find((psi) => psi.subject_id === subject_id);
            if (task_psi) {
                if (task_psi.psi_id) {
                    return task_psi.psi_name;
                } else {
                    return task_psi.subject_text;
                }
            } else {
                if (subject.subject_type === "LOV") {
                    return "Не указано";
                }
            }
                
        }

        const getPsiValue = (subject_id) => {
            const task_psi_ = Project.task.psi_list.filter(task_psi => task_psi.subject_id == subject_id);
            if (task_psi_.length > 0) {
                // найдено како то значение в таске
                // надо сравнить со списком option
                const option = psiSelectOptions.filter(psi => task_psi_[0].psi_id == psi.value);
                return option;
            }
        }

        return <Row style={{marginTop: "6px"}} key={subject.subject_id}>
            <Col>
                <div>
                    <small>{subject.subject_name}</small>
                </div>
                <div>
                    {
                    subject.subject_type === "TEXT" ? 
                        // <Form.Group className="mb-3" controlId="modalText">
                        <LinkInput
                            type="textField"
                            placeholder={`Укажите ${subject.subject_name}`}
                            defaultValue={getPsiDisplayValue(subject.subject_id)}
                            callBack={(value) => {
                                const psi_list = [];
                                const psi = {};
                                psi.subject_text = value;
                                psi.subject_id = subject.subject_id;
                                psi_list.push(psi);
                                saveTask({psi_list : psi_list})
                                // saveTask({task_title : value})}
                            }}
                        />
                        // </Form.Group>
                        // <Form.Control
                        //     type="text"
                        //     placeholder={`Укажите ${subject.subject_name}`}
                        //     defaultValue={getPsiDisplayValue(subject.subject_id)}
                        //     // autoFocus
                        //     // onChange={onChange}
                            
                        //     onChange={
                        //         (e) => {console.log("onSubmit")}
                        //     }
                        // />
                    :
                        <LinkInput 
                            type="selectList"
                            // placeholder="Исполнитель"
                            onHandleEdit={() => {
                                // fetch psi by subject.subject_id
                                fetchProjectSubjectItems({project_id : project_id, subject_id : subject.subject_id});
                            }}
                            defaultDisplay={getPsiDisplayValue(subject.subject_id)}
                            value={getPsiValue(subject.subject_id)}
                            options={psiSelectOptions}
                            callBack={value => {
                                const psi_list = [];
                                const psi = {};
                                psi.psi_id = value;
                                psi.subject_id = subject.subject_id;
                                psi_list.push(psi);
                                saveTask({psi_list : psi_list})
                            }}
                        />
                    }
                </div>
            </Col>
        </Row>
    })



    return (
        <div 
            ref={scrollContainerRef}
            style={{
                height: '100vh',
                overflowY: 'auto',
                padding: '10px'
            }}
        >
            {/* Кнопки прокрутки */}
            <div style={{ position: 'fixed', right: '40px', bottom: '20px', zIndex: 1000 }}>
                <Button 
                    variant="outline-secondary" 
                    onClick={scrollToTop}
                    style={{ marginBottom: '10px', display: 'block' }}
                    title="Прокрутить вверх"
                >
                    <i className="bi bi-arrow-up"></i>
                </Button>
                <Button 
                    variant="outline-secondary" 
                    onClick={scrollToBottom}
                    title="Прокрутить вниз"
                >
                    <i className="bi bi-arrow-down"></i>
                </Button>
            </div>

        <Row>
            {/* Модалка создания */}
            <PttModal 
                fullscreen={true}
                show={showModalPttEdit} 
                callBack={actionCallModaPttCallback}
                deleteCallBack={actionCallModaPttDeleteCallback}
            />
            <ModalInputFile 
                title={"Загрузить файл"} 
                show={showModalUploadFile} 
                callBack= {actionUploadFileCallBack}  
            />
            <Col sm={12} lg={9}>
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
                {/* Временная таблица */}
                <Row style={{marginTop:"6px"}}>
                    <Col>
                    <Accordion defaultActiveKey="1">
                        <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            <small><b>Учет затраченного времени</b></small>&nbsp;
                            <Badge bg="secondary">{timetableItems.length}</Badge>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Button style={{padding: "0px"}} type="button" variant="" onClick={(e) => actionCallPtt(e)} >
                                    <i className="bi bi-plus-circle"></i>
                                </Button>
                                {Project.task?.timetable.some((timeline) => 
                                    timeline.user_id == User.profile.user_id 
                                        && !timeline.date_end) ?
                                        <Button variant="" onClick={stopPtt}>
                                            <i className="bi bi-stop-circle"></i>
                                        </Button>
                                        :
                                        <Button variant="" onClick={startPtt}>
                                            <i className="bi bi-play-circle"></i>
                                        </Button>
                                }
                            </Form.Group>
                            {timetableItems}
                        </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    </Col>
                </Row>
                {/* Файлы */}
                <Row style={{marginTop:"6px"}}>
                    <Col>
                    <Accordion defaultActiveKey="1">
                        <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            <small><b>Файлы</b></small>&nbsp;
                            <Badge bg="secondary">{fileItems.length}</Badge>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Form.Group className="mb-3">
                                <Button style={{padding: "0px"}} 
                                    type="button" 
                                    variant="" 
                                    onClick={(e) => {e.preventDefault();setShowModalUploadFile(true);}} >
                                    <i className="bi bi-plus-circle"></i>
                                </Button>
                            </Form.Group>
                            {fileItems}
                        </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    </Col>
                </Row>
                {/* Комментарии */}
                <Row style={{marginTop:"6px"}}>
                    <Col>
                    <Accordion defaultActiveKey="1">
                        <Accordion.Item eventKey="1">
                        <Accordion.Header>
                            <small><b>Комментарии</b></small>&nbsp;
                            <Badge bg="secondary">{commentItems.length}</Badge>
                        </Accordion.Header>
                        <Accordion.Body>
                            {commentItems}
                        </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    </Col>
                </Row>
                <DragDropFile files = { <FilesContainer callBack={(value) => {
                                    submitComment({value});
                                }}/> } callBack= {actionUploadFileCallBack}  />
            </Col>
            <Col>
                {/* <Row style={{marginTop: "8px"}}>
                    <Col>
                        
                    </Col>
                </Row> */}
                <Row>
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
                <Row style={{marginTop: "6px"}}>
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
                <Row style={{marginTop: "6px"}}>
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
                <Row style={{marginTop: "24px"}}>
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
                <Row style={{marginTop: "24px", marginBottom : "22px"}}>
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
                {projectSubjectItems}
            </Col>
        </Row>
        </div>
    )
}

export default TaskForm;