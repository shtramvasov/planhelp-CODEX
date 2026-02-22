import { Row, Col, Container, Card, Button, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { wsSocket } from '../../network/WebSocket';
import { getChatDialog, getChatDialogList, postChatDialog } from "../../network/ChatNetwork";
import { addChatDialogList, addChatDialog, addChatChatDialogMesageList, appendChatDialogMessage } from "../../reducers/Chat";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { Navbar }  from "../navbar/Navbar";
import ChatDialogList from "./ChatDialogList";
import DialogMessageList from "./DialogMessageList";
import ChatDialog from './ChatDialog';

function Chat(props) {
    
    document.title = "Чат | planhelp";

    const { chat_id } = useParams();

    const dispatch = useDispatch()
    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();
    
    const chatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);

    const [showModalChatDialogEdit, setShowModalChatDialogEdit] = useState(false);
    const [chatDialogMessage,setChatDialogMessage] = useState("");
    
    wsSocket.onmessage = (event) => {
        const wsMessage = JSON.parse(event.data);
        console.log(wsMessage);
        if (wsMessage.chat_message_list) {
            dispatch(addChatChatDialogMesageList(wsMessage.chat_message_list));
        }
        if (wsMessage.chat_message) {
            if (chat_id == wsMessage.chat_message.chat_id) {
                dispatch(appendChatDialogMessage(wsMessage.chat_message));
            }
        }
    }
    // кликнули на диалог чата
    useEffect(() => {
        // alert(chat_id);
        // подменить заголовок в диалоге надо
    },[chat_id]);

    const actionOnChatDialogCallback = () => {
        setShowModalChatDialogEdit(false);
        fetchChatDialogList();
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

    const actionSendMessage = (e) => {
        e.preventDefault();
        if (User.isOnline) {
            wsSocket.socket.send(JSON.stringify({
                action : "msg",
                payload : {
                    chat_id,
                    text : chatDialogMessage
                }
            }));
            setChatDialogMessage("");
        } else {
            dispatch(addNegativeMessage("Вы офлайн, отправка сообщений невозможна"));
        }
    }

    return (<>
        <Container fluid>
        <Row>
            <Col>
                <Navbar />
                <br/>
                <Row>
                    <Col xs={3}>
                        <div style={{overflow: "auto", whiteSpace: "nowrap"}}>
                        <div
                            style={{
                                verticalAlign: "top",
                                // minHeight : "400px",
                                height :"85vh",
                                overflow: "auto",
                                scrollbarWidth: "thin"
                            }}>
                        <ChatDialogList />
                        </div>
                        </div>
                    </Col>
                    {chat_id ? 
                        <Col xs={9}>
                            <div className="p-3 bg-light rounded-3 border" >
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/chat/`); }}><i className="bi bi-arrow-left"></i></a>
                                &nbsp;&nbsp;<span style={{fontWeight: "500"}}>{chatDialog?.chat_name}</span>
                                {chatDialog?.chat_type == 2 ? <>&nbsp;<a href="#" onClick={(e) => { e.preventDefault();setShowModalChatDialogEdit(true) }}><i className="bi bi-info-circle"></i></a> </>: ""}
                                
                            </div>
                            <div style={{marginTop: "4px"}}>
                                <DialogMessageList />
                            </div>
                            <form onSubmit={actionSendMessage}>
                            <Form.Group className="mb-3" controlId="formMessage">
                            <div style={{marginTop: "8px"}} className="d-flex align-items-start gap-2">
                                <Form.Control
                                    type="text" 
                                    as="textarea"
                                    value={chatDialogMessage}
                                    onChange={(e) =>{setChatDialogMessage(e.target.value)}}
                                    rows={1}
                                    placeholder={"Напишите ваше сообщение..."}
                                    />     
                                <Button type="submit">Отправить</Button>
                            </div>
                            </Form.Group>
                            </form>
                        </Col>
                        : ""
                    }
                </Row>
            </Col>
        </Row>
        </Container>
        {/* Модалка редактирования чата*/}
        <ChatDialog 
            fullscreen={true}
            show={showModalChatDialogEdit}
            chat_id={chat_id}
            callBack={actionOnChatDialogCallback}
        />
        </>
    )
}
export default Chat;