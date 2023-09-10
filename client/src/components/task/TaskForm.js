import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment-timezone';
import { getTask } from '../../network/TaskNetwork';
import { addTask } from '../../reducers/Project';
import { useNavigate , useSearchParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import 'moment/locale/ru';
moment.locale('ru');

function TaskForm(props) {

    const [isEdit, setIsEdit] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { project_id, task_id } = useParams();

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

    return (
    <form onSubmit={() => {alert("submit")}}>
        <Row>
            <Col sm={12} lg={10}>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="modalText">
                            <Form.Control
                                type="text"
                                placeholder={"Тайтл"}
                                // defaultValue={props.note.note}
                                autoFocus/>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="modalText">
                            <Form.Control
                                type="text"
                                as="textarea"
                                rows={10}
                                placeholder={"Текст задачи"}
                                // defaultValue={props.note.note}
                                autoFocus/>
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
                            <a href="https://t.me/planhelpbot" className="phLink">predeinay</a>
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Ответственный</small>
                        </div>
                        <div>
                            <a href="https://t.me/planhelpbot" className="phLink">forson</a>
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "8px"}}>
                    <Col>
                        <div>
                            <small>Ревьювер</small>
                        </div>
                        <div>
                            <a href="https://t.me/planhelpbot" className="phLink">timofey</a>
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: "32px"}}>
                    <Col>
                        <div>
                            <small>Статус</small>
                        </div>
                        <div>
                            <a href="https://t.me/planhelpbot" className="phLink">todo</a>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
    </form>
    )
}

export default TaskForm;