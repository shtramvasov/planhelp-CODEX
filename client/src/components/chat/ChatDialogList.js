import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { Navbar }  from "../navbar/Navbar";
import { ListGroup, Badge, Button, Dropdown, Form } from 'react-bootstrap';
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import { getChatDialog, getChatDialogList, postChatDialog } from "../../network/ChatNetwork";
import { getUsers } from '../../network/UserNetwork';
import { addChatDialogList, addChatDialog } from "../../reducers/Chat";
import { addUserList } from '../../reducers/User'
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { messages } from "../constants/Msg";
import { wsSocket } from '../../network/WebSocket';
import { getColorChatGradient, getShortChatName } from '../helpers/Chat';

function ChatDialogList(props) {

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { chat_id } = useParams();

    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);

    const [showModalCreateGroupDialogChat, setShowModalCreateGroupDialogChat] = useState(false);
    const [showModalCreatePersonalDialogChat, setShowModalCreatePersonalDialogChat] = useState(false);
    const [newChatType, setNewChatType] = useState(1);
    const [findDialogText, setFindDialogText] = useState("");

    // Первичная загрузка данных,
    // useEffect(() => {
    //     fetchChatDialogList();
    // },[]);

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
                    // getnew chats??
                    wsSocket.socket.send(JSON.stringify({
                        // action_id : crypto.randomUUID(),
                        action : "chat_list",
                        payload : {}
                    }));
                    dispatch(addPositiveMessage(messages.SUCCESS));
                    // fetchChatDialogList();
                } else {
                    dispatch(addNegativeMessage(err));
                }
            }
        );
    }
    
    const items = Chat.chatDialogList
    .filter((chatDialog) => {
        return chatDialog.chat_name?.toUpperCase().includes(findDialogText.toUpperCase());
    })
    .map((chatDialog) => {
        // active={chat_id == chatDialog.chat_id}
        return <ListGroup.Item style={{padding : "8px"}}key={chatDialog.chat_id} action onClick={(e) => onChatDialogClick(e, chatDialog.chat_id)} variant="light" >
            {chatDialog.avatar_url ? 
                <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px"}}>
                    <img className='chat-dialog-icon' src={chatDialog.avatar_url} />
                    {/* <b>{getShortChatName(chatDialog.chat_name)}</b> */}
                </div>
            :
                <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px", background : getColorChatGradient(chatDialog.with_user_id ? chatDialog.with_user_id : chatDialog.chat_id)}}>
                    <b>{getShortChatName(chatDialog.chat_name)}</b>
                </div>
            }
            {Chat.onLineClients[chatDialog.with_user_id] ? <div style={{position: "absolute", marginLeft : "26px", marginTop: "14px"}}><i className="bi bi-dot fs-1" style={{color: "green"}}></i></div>: ""}
            {chatDialog.chat_type == 1 ? "" : <i className="bi bi-people-fill">&nbsp;</i>}
            <span style={{
                overflow: "clip", display : "inline-block", width: "67%",
                color: chat_id == chatDialog.chat_id ? "black":"",
                fontWeight: chat_id == chatDialog.chat_id ? "bold":""
                }}>{chatDialog.notify_status == 0 ? <i className="bi bi-volume-mute-fill"></i> : ""} <b><small>{chatDialog.chat_name}</small></b></span>
                {chatDialog.last_message_count ? 
                    <Badge bg={chatDialog.notify_status == 0 ? "secondary" : "danger"} pill>{chatDialog.last_message_count}</Badge> 
                    : "" }
            <br/>
            <small style={{overflow: "clip", display : "inline-block", width: "83%"}}>{chatDialog.last_message ? chatDialog.last_message : <br/>}</small>
        </ListGroup.Item>
    });


    return (<>
        <div className="p-3 bg-light rounded-3 border">
            <div style={{float: "left"}}>
                <h3>Чаты</h3>
            </div>
            <div style={{float: "right"}}>
            <Dropdown>
                <Dropdown.Toggle className="no-caret" style={{borderRadius: "50%"}} ><i className="bi bi-person-plus"></i></Dropdown.Toggle>
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
            </div>
            <br/><br/>
            <div>
                
                <Form.Control
                    type="text"
                    // rows={props.rows}
                    placeholder={"Поиск диалога"}
                    // defaultValue={value}
                    onChange={(e)=> { setFindDialogText(e.target.value) }}
                    // autoFocus
                    />    
            </div>
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