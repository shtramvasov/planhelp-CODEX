import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {Row, Col} from 'react-bootstrap';
import moment from 'moment-timezone';
import { addPtt } from '../../../reducers/Project';
import { useSelector, useDispatch } from 'react-redux';
import LinkInput from '../../helpers/LinkInput';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import 'moment/locale/ru';
moment.locale('ru');


function PttModal(props) {

    // const [dateStart, setDateStart] = useState(null);
    // const [dateEnd, setDateEnd] = useState(null);
    // const [userId, setUserId] = useState(null);
    

    const dispatch = useDispatch();
    const User = useSelector((state) => state.user);
    const Project = useSelector((state) => state.project);

    // мапированный массив пользователей
    const userSelectOptions = Project.project.project_user_list.map(user => {
        return {value : user.user_id, label : user.login}
    });

    const executorSelectOptionsDefault = userSelectOptions.filter(user => user.value == Project.ptt.user_id)[0];

    const closeMe = () => {
        // setTaskNote("");
        props.callBack();
    }

    const submit = (e) => {
        e.preventDefault();
        props.callBack(Project.ptt);
    }

    const onChange = ({user_id, date_start, date_end, login}) => {
        console.log("user_id",user_id)
        dispatch(addPtt(
            {   ...Project.ptt,
                login : login ? login : Project.ptt.login,
                user_id : user_id ? user_id : Project.ptt.user_id,
                date_start : date_start ? date_start : Project.ptt.date_start,
                date_end : date_end ? date_end : Project.ptt.date_end
            }
        ))
    }

    return (
        <div>
            <Modal show={props.show} onHide={closeMe}>
                <form onSubmit={submit}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{Project.ptt.ptt_id ? 'Изменить затраченное время': "Добавить затраченное время"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Row>
                        <Col>
                        <Row>
                            <Col>
                                <div><small>Исполнитель</small></div>
                                <LinkInput 
                                    type="selectList"
                                    placeholder="Исполнитель"
                                    defaultDisplay={Project.ptt.login}
                                    value={executorSelectOptionsDefault}
                                    options={userSelectOptions}
                                    callBack={ (value, label) => { onChange({user_id : value, login : label}) } }
                                />
                                {/* <span>
                                    <i className="bi bi-person"></i> {props.timeline?.login}
                                </span> */}
                            </Col>
                        </Row>
                        <Row style={{marginTop : "6px"}}>
                            <Col>
                                <div><small>Дата и время начала</small></div>
                                <DatePicker 
                                    wrapperClassName="datePicker" 
                                    showTimeSelect
                                    timeIntervals={5}
                                    selected={Project.ptt.date_start ? moment(Project.ptt.date_start).toDate() : null} 
                                    onChange={(date) => {onChange({date_start : date.toISOString()})}} 
                                    dateFormat="d.MM.yyyy HH:mm"
                                    timeFormat='HH:mm'
                                />
                            </Col>
                            <Col>
                                <div><small>Дата время окончания</small></div>
                                <DatePicker 
                                    wrapperClassName="datePicker" 
                                    showTimeSelect
                                    timeIntervals={5}
                                    selected={Project.ptt.date_end ? moment(Project.ptt.date_end).toDate() : null} 
                                    onChange={(date) => {onChange({date_end : date.toISOString()})}} 
                                    dateFormat="d.MM.yyyy HH:mm"
                                    timeFormat='HH:mm'
                                />
                            </Col>
                            </Row>
                        </Col>
                    </Row>
                    </Modal.Body>

                    <Modal.Footer>
                        {Project.ptt.ptt_id ? 
                        <Button 
                            variant="outline-danger" 
                            type="button"
                            onClick={(e)=>{e.preventDefault();props.deleteCallBack(Project.ptt)}}>
                            Удалить
                        </Button>
                        :
                        ""
                        }
                        <Button variant="outline-primary" type="submit">
                            Сохранить
                        </Button>
                    </Modal.Footer>    
                </form>
            </Modal>
        </div>
    )
}

export default PttModal;