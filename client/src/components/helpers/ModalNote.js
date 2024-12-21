import React, { useState , useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

// Условно ли выбираются дата и время ?
// для календаря нет
// для документов да
// conditionalRemindDateTime true / false (undefined)

function ModalNote(props) {
    // свитчер напоминания
    const [isRemind, setRemind] = useState(false);
    
    const closeMe = () => {
        props.callBack(null,"cancel");
    }
    useEffect(() => {
        if (props.note.is_remind) {
            setRemind(true);
        } else {
            setRemind(false);
        }
    },[props.note]);

    const deleteMe = (e) => {
        e.preventDefault();
        props.callBack({
            note_id : props.note.note_id,
            is_deleted : 1,
            note : props.note.note,
            note_type : props.note.note_type,
            note_2 : props.note.note_2
        },"delete");
    }

    const saveMe = (e) => {
        e.preventDefault();
        let remind_on;
        if (e.target.remind_date?.value && e.target.remind_time?.value) {
            remind_on = e.target.remind_date?.value 
                + ' ' + e.target.remind_time?.value+":00";
            // // const dateParts = e.target.remind_date?.value.split('.');
            // console.log(e.target.remind_date?.value);
            // remind_on = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
            // // remind_on+= ' '+e.target.remind_time?.value+":00"
        }
        props.callBack({
            note : e.target.modalText.value,
            remind_on : remind_on,
            variant : e.target.modalVariant.value,
            note_id : e.target.modalId.value,
            note_type : e.target.modalNoteType.value,
            note_2 : e.target.modalNote2?.value,
            // "напомнить" только если указан remind_on
            is_remind : isRemind ? remind_on ? 1 : 0 : 0
        }, "save");
    }

    const remindOn = props.note.remind_on?moment(props.note.remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD HH:mm'):"";
    
    return (
    <Modal show={props.show} onHide={closeMe}>
    <form onSubmit={saveMe}>
        <Modal.Header closeButton={true}>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group controlId="modalId">
                <Form.Control
                    type="hidden"
                    defaultValue={props.note.note_id}
                />
            </Form.Group>
            <Form.Group controlId="modalNoteType">
                <Form.Control
                    type="hidden"
                    defaultValue={props.note.note_type}
                />
            </Form.Group>
            {props.note.entity_id?
                <Form.Group className="mb-3" controlId="modalText">
                    <Row>
                        <Col>
                            <a className="phLink" href={`/disk/${props.note.entity_id}/file/read`}>Перейти в документ</a>
                        </Col>
                    </Row>
                </Form.Group>:""
            }
            <Form.Group className="mb-3" controlId="modalText">
                <Row>
                    <Col>
                    <Form.Control
                        type="text"
                        as="textarea"
                        placeholder={props.placeholder}
                        defaultValue={props.note.note}
                        autoFocus/>
                    </Col>
                </Row>
            </Form.Group>
            {props.note.note_type==="FILE"?
             <Form.Group className="mb-3" controlId="modalNote2">
                <Row>
                    <Col>
                    <Form.Control
                        type="text"
                        as="textarea"
                        placeholder={props.placeholder}
                        defaultValue={props.note.note_2}
                        autoFocus/>
                    </Col>
                </Row>
            </Form.Group>:""}
            <Form.Group controlId="modalVariant">
                <Row>
                    <Col>
                    <Form.Select defaultValue={props.note.variant}>
                        <option value="">Без фона</option>
                        <option value="light">Светлый</option>
                        <option value="primary">Синий</option>
                        <option value="secondary">Серый</option>
                        <option value="success">Зеленый</option>
                        <option value="warning">Оранжевый</option>
                        <option value="danger">Красный</option>
                        <option value="info">Голубой</option>
                        <option value="dark">Темный</option>
                    </Form.Select>
                    </Col>
                </Row>
            </Form.Group>
            <Row style={{marginTop: "30px"}}>
                <Col>
                    Добавить в календарь
                </Col>
            </Row>
            <Row style={{marginTop: "6px"}}>
                <Col>
                    <Form.Control 
                        type="date" 
                        id="remind_date"
                        defaultValue={remindOn?remindOn.split(" ")[0]:null}
                    />
                </Col>
                <Col>
                    <Form.Control 
                        type="time" 
                        id="remind_time"
                        defaultValue={remindOn?remindOn.split(" ")[1]:null}
                    />
                </Col>
            </Row>
            <Row style={{marginTop: "10px"}}>
                <Col>
                    <Form.Check 
                        type="switch"
                        id="custom-switch"
                        label="Напомнить (telegram push)"
                        onChange={(e) => {setRemind(e.target.checked)}}
                        checked={isRemind}
                    />
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {props.note?.note_id?
                <Button variant="outline-danger" onClick={deleteMe}>
                    <i className="bi bi-trash"></i>
                </Button> : ""
            }
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


export default ModalNote;