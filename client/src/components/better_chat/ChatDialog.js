import React, { useState , useEffect} from 'react';
import { Button, Form, ButtonGroup, Row, Col, Badge, Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { getChatDialog, getChatDialogList, postChatDialog, postChatDialogUser, deleteChatDialogUser} from "../../network/ChatNetwork";
import { getUsers } from '../../network/UserNetwork';
import { addChatDialogList, addChatDialog } from "../../reducers/Chat";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { addUserList } from '../../reducers/User';
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import { messages } from "../constants/Msg";
import LinkInput from '../helpers/LinkInput';
import 'moment/locale/ru';
moment.locale('ru');

/**
 * Компонент описывающий редактирование задачи
 * @param {*} props 
 * @returns 
 */
function ChatDialog(props) {

    const dispatch = useDispatch()
    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);

    const { chat_id } = props;

    const [showModalAddUserDialogChat, setShowModalAddUserDialogChat] = useState(false);

    const closeMe = () => {
        props.callBack();
    }

    // Первичная загрузка данных,
    useEffect(() => {
        if (props.show) {
            fetchChatDialog();
        }
    },[props.show]);

    const fetchChatDialog = () => {
        getChatDialog({chat_id},(err,resp) => {
            if (!err) {
                dispatch(addChatDialog(resp));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    }

    // Фетчер для контекстного поиска юзера при указании прав
    const fetchUsers = (search, cb) => {
        if (search) {
            getUsers({search}, (err,resp) => {
                resp.map((el) => {
                    el.display_val = el.login;
                    el.return_val = el.user_id;
                })
                dispatch(addUserList(resp));
            })
        } else {
            dispatch(addUserList([]));
        }
    }

    // Колбэк с модалки после изменения названия чата
    const actionNewChatDialogName = (chat_name) => {
        if (!chat_name) return;
        
        postChatDialog(
            {
                chat_id,
                chat_name
            }, 
            (err,resp) => {
                if (!err) {
                    dispatch(addPositiveMessage(messages.SUCCESS));
                    fetchChatDialog();
                } else {
                    dispatch(addNegativeMessage(err));
                }
            }
        );
    }

    const actionNewUserAdd = (user_id) => {
        setShowModalAddUserDialogChat(false);
        if (!user_id) return;
        postChatDialogUser({
            chat_id,
            user_id,
            user_role : "WRITE"
        }, (err, resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchChatDialog();
            } else {
                dispatch(addNegativeMessage(err));
            }
        })
    }

    const actionDelUser = (user_id) => {
        deleteChatDialogUser({
            chat_id,
            user_id
        },(err) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                fetchChatDialog();
            } else {
                dispatch(addNegativeMessage(err));
            }
        })
    }

    const actionChangeNotifySwitch = (e) => {
        postChatDialog(
            {
                chat_id,
                notify_status:e.target.checked?1:0
            }, 
            (err,resp) => {
                if (!err) {
                    dispatch(addPositiveMessage(messages.SUCCESS));
                    fetchChatDialog();
                } else {
                    dispatch(addNegativeMessage(err));
                }
            }
        );
    }

    const listUsers = Chat.chatDialog.chat_user_list.map((el) =>
        <tr key={el.user_id}>
            <td>{el.login}</td>
            <td><Badge bg="primary">{el.user_role}</Badge></td>
            <td>{
                <Button type="button" variant="outline-danger" onClick={(e) => {e.preventDefault(); actionDelUser(el.user_id); }}>
                    <i className="bi bi-trash3"></i>
                </Button>}</td>
        </tr>
    );

    return (
        <div className="modal-90w">

        <ModalAutoComplete 
            title={"Добавить пользователя в чат"} 
            placeholder="Начните вводить для поиска"
            show={showModalAddUserDialogChat} 
            callBack={actionNewUserAdd} 
            fetcher={fetchUsers}
            data={User.userList}
        />

        <Modal show={props.show} onHide={closeMe} fullscreen={true}>
            {/* <form onSubmit={() => {alert("submit")}}> */}
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                    <span style={{fontSize: "0.8em"}}>
                        {Chat.chatDialog.chat_name}
                    </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Chat.chatDialog.chat_type == 2 ? 
                        // имя чата только для группового
                        <LinkInput
                                type="headerField"
                                placeholder={`Укажите название чата`}
                                defaultValue={Chat.chatDialog.chat_name}
                                callBack={(value) => {
                                    actionNewChatDialogName(value);
                                }}
                            />
                    :""}
                    {Chat.chatDialog.chat_type == 2 ?
                        // Добавить юзера только для группового
                        <Button
                            style={{paddingLeft: "0px"}}
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(addUserList([]));
                                setShowModalAddUserDialogChat(true);
                            }}
                            variant=""
                            >Добавить пользователя <i className="bi bi-person-add"></i>
                        </Button>
                    :""}
                        <Form.Check 
                            type="switch"
                            id="custom-switch"
                            label="Уведомления этого чата"
                            onChange={actionChangeNotifySwitch}
                            checked={Chat.chatDialog.notify_status==1?true:false}
                        />
                    
                    <br/><br/>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Пользователь</th>
                                <th>Роль</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listUsers}
                        </tbody>
                    </Table>

                </Modal.Body>
                {/* <Modal.Footer>
                </Modal.Footer> */}
            {/* </form> */}
        </Modal>
        </div>
    );
}


export default ChatDialog;