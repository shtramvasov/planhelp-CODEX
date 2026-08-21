import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment-timezone';
import { getTask } from '../../../network/TaskNetwork';
import { addTask } from '../../../reducers/Project';
import { Link, useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import LinkInput from '../../helpers/LinkInput';
import Select from 'react-select';

// Обработчик markdown 
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw";
// Редактор markdown
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

import 'moment/locale/ru';
moment.locale('ru');

/**
 * Компонент описывающий форму создания новой задачи
 * @param {*} props 
 * @returns 
 */
function TaskCreateModal(props) {

    const [taskNote, setTaskNote]  = useState("");
    const [statusOption, setStatusOption]  = useState({});

    const Project = useSelector((state) => state.project);

    // мапированный массив статусов
    const statusSelectOptions = Project.project.project_status_list.map(status => {
        return {value : status.status_id, label : status.status_name}
    });

    // init
    useEffect(() => {
        // первичный статус
        handelStatusChange(statusSelectOptions[0]);
    },[Project.project.project_status_list]);

    // Создаем объект <table> со стилями bootstrap, для использования его в markdown
    const MarkdownTable = props => {
        return (<table className="table table-bordered"> {props.children} </table>)
    }

    const handelStatusChange = (statusOption) => {
        setStatusOption(statusOption);
    }

    const handleEditorChange = ({ html, text }) => {
        setTaskNote(text);
    }

    const MarkdownObject = (props) => {
        // 1. components: прокидываем свои html объекты
        // 2. children: markdown -> стилевый текст
        // 3. remarkPlugins: плагины для поддержки таблиц, стилей текста
        return <ReactMarkdown 
            components={{ table: MarkdownTable }} 
            children={ props.value } 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]} 
        /> 
    }

    const closeMe = () => {
        setTaskNote("");
        props.callBack();
    }

    const submit = (e) => {
        e.preventDefault();
        
        props.callBack({
            task_title : e.target.taskTitle.value,
            task_note : taskNote,
            status_id : statusOption.value
        })
        setTaskNote("");
    }
    return (
        <div className="modal-90w">
        <Modal show={props.show} onHide={closeMe} dialogClassName="modal-90w">
            <form onSubmit={submit}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>Новая задача</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="taskTitle">
                            <Form.Control
                                type="text"
                                placeholder={"Заголовок задачи"}
                                autoFocus/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>  
                    <Col>
                        <MdEditor 
                            view={{menu: true, md: true, html: false}}  
                            onChange={handleEditorChange} 
                            value={taskNote}  
                            style={{ height: '200px' }} 
                            renderHTML={ text => <MarkdownObject value = {text} /> } 
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: "14px"}}>
                    <Col lg={2}>
                        <Form.Group className="mb-3" controlId="status_id"> 
                        <Select 
                            closeMenuOnSelect={true} 
                            onChange={(option) => {handelStatusChange(option)}}
                            value={statusOption}
                            placeholder="Статус" 
                            options={statusSelectOptions}
                        />
                        </Form.Group>
                    </Col>
                </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="outline-primary" type="submit">
                        Сохранить
                    </Button>
                </Modal.Footer>    
            </form>
        </Modal>
        </div>
    )
}

export default TaskCreateModal;