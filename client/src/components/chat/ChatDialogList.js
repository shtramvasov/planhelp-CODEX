import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { Navbar }  from "../navbar/Navbar";
import { ListGroup, Badge, Button, Dropdown } from 'react-bootstrap';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import { getChatDialog, getChatDialogList, postChatDialog } from "../../network/ChatNetwork";
import { getUsers } from '../../network/UserNetwork';
import { addChatDialogList, addChatDialog } from "../../reducers/Chat";
import { addUserList } from '../../reducers/User'
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { messages } from "../constants/Msg";

function ChatDialogList(props) {

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { chat_id } = useParams();

    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);

    const [showModalCreateGroupDialogChat, setShowModalCreateGroupDialogChat] = useState(false);
    const [showModalCreatePersonalDialogChat, setShowModalCreatePersonalDialogChat] = useState(false);
    const [newChatType, setNewChatType] = useState(1);

    // Первичная загрузка данных,
    useEffect(() => {
        fetchChatDialogList();
    },[]);

    const onChatDialogClick = (e, chat_id) => {
        e.preventDefault();
        navigate(`/chat/${chat_id}`);
    }

    const fetchChatDialogList = () => {
        getChatDialogList({chat_id},(err,resp) => {
            if (!err) {
                dispatch(addChatDialogList(resp));
            } else {
                dispatch(addNegativeMessage(err));
            }
        });
    };

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

    // Колбэк с модалки после создания чата
    // либо персонального, либо группового
    const actionNewChatCallBack = (payload) => {
        setShowModalCreateGroupDialogChat(false);
        setShowModalCreatePersonalDialogChat(false);
        if (!payload) return;
        console.log(payload);
        postChatDialog(
            {
                chat_type : newChatType,
                chat_name : newChatType == 1 ? "" : payload,
                user_id : newChatType == 1 ? payload : undefined // личный
            }, 
            (err,resp) => {
                if (!err) {
                    dispatch(addPositiveMessage(messages.SUCCESS));
                    fetchChatDialogList();
                } else {
                    dispatch(addNegativeMessage(err));
                }
            }
        );
    }

    const items = Chat.chatDialogList.map((chatDialog) => {
        // active={chat_id == chatDialog.chat_id}
        return <ListGroup.Item  action onClick={(e) => onChatDialogClick(e, chatDialog.chat_id)} variant="light" current>
            {chatDialog.chat_type == 1 ? "" : <i class="bi bi-people-fill"></i>}&nbsp;
            <span style={{color: chat_id == chatDialog.chat_id ? "black":""}}>{chatDialog.chat_name}</span> {chatDialog.last_message_count ? <Badge bg="primary" pill>{chatDialog.last_message_count}</Badge> :""}
            <br/>
            <small>{chatDialog.last_message ? chatDialog.last_message : <br/>}</small>
        </ListGroup.Item>
    });


    return (<>
        <div class="p-3 bg-light rounded-3 border">
            <Dropdown>
                <Dropdown.Toggle className="border-0" style={{padding: "0px"}} variant="">Новый чат <i className="bi bi-plus-circle"></i></Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={(e) => {
                            e.preventDefault();
                            setNewChatType(1);
                            dispatch(addUserList([]));
                            setShowModalCreatePersonalDialogChat(true);
                        }}>
                        Личный чат
                    </Dropdown.Item>
                    <Dropdown.Item 
                        onClick={(e) => {
                            e.preventDefault();
                            setNewChatType(2);
                            setShowModalCreateGroupDialogChat(true);
                        }}>
                        Групповой чат
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {/* <span style={{fontWeight: "500"}}>Новый чат</span> <a href="#" onClick={(e) => {e.preventDefault();setShowModalCreateDialogChat(true)}}><i className="bi bi-plus-circle"></i></a> */}
        </div>
        <div style={{marginTop: "4px"}}>
            <ListGroup>
                {items}
            </ListGroup>
        </div>
        <ModalOneInputText title={"Новый групповой чат"} show={showModalCreateGroupDialogChat} callBack={actionNewChatCallBack} />
        <ModalAutoComplete 
            title={"Новый чат с пользователем"} 
            placeholder="Начните вводить для поиска"
            show={showModalCreatePersonalDialogChat} 
            callBack={actionNewChatCallBack} 
            fetcher={fetchUsers}
            data={User.userList}/>
        </>
    )
}
export default ChatDialogList;