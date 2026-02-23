import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import {Form, Card} from 'react-bootstrap';
import { wsSocket } from '../../network/WebSocket';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function ChatDialog(props) {

    const { chat_id } = useParams();

    const dispatch = useDispatch()
    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();
    
    const chatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);
    const messagesEndRef = useRef(null);

    const [showModalChatDialogEdit, setShowModalChatDialogEdit] = useState(false);
    const [chatDialogMessage,setChatDialogMessage] = useState("");

    // // кликнули на диалог чата
    // useEffect(() => {
    //     if (User.isOnline) {
    //         actionGetChatDialogMessageList();
    //     }
    // },[chat_id, User.isOnline]);

    // 2. Function to scroll to the ref's location
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({  block: 'end' });
    };

    // 3. Call the scroll function whenever messages update
    useEffect(() => {
        scrollToBottom();
    }, [Chat.messageList]); // Add messages as a dependency

    // const actionGetChatDialogMessageList = () => {
        
    //     wsSocket.socket.send(JSON.stringify({
    //         action : "msg_list",
    //         payload : {
    //             chat_id
    //         }
    //     }));
    // }

    const items = Chat.messageList.map((message) => 
        <>
        {message.login == User.profile.login ? 
            <>
            <div style={{paddingRight: "10px"}} className="d-flex justify-content-end mb-2">
            <div style={{maxWidth: "75%"}}>
                <div style={{paddingLeft: "0px"}} >
                    <p className="small mb-0 mt-1"><b>{message.login}:</b></p>
                </div>
                <div className="p-3 bg-primary text-white rounded-3 shadow-sm">
                    <p className="small mb-0">{message.message_text}</p>
                    <small><p className="small text-white-50 mb-0 text-end mt-1">{moment(message.created_at,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}</p></small>
                </div>
                
            </div>
            </div>
            </>
        : 
            <>
            <div style={{paddingLeft: "8px"}} >
                <p className="small mb-0 mt-1"><b>{message.login}:</b></p>
            </div>
            <div style={{paddingLeft: "10px"}} className="d-flex justify-content-start mb-2">
                <div className="p-3 bg-light rounded-3 shadow-sm" style={{maxWidth: "75%"}}>
                    <p className="small mb-0">{message.message_text}</p>
                    <small><p className="small text-muted mb-0 text-end mt-1">{moment(message.created_at,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}</p></small>
                </div>
            </div>
            </>
        }
        </>
    )
    return (
        <Card>
                            {/* <Card.Header>Чатик с кем то <i className="bi bi-info-circle"></i> </Card.Header> */}
                            <Card.Body style={{padding: "0px"}}>
                            <div style={{overflow: "auto"}}>
                                <div style={{
                                    verticalAlign: "top",
                                    // minHeight : "400px",
                                    height :"69vh",
                                    overflow: "auto",
                                    scrollbarWidth: "thin",
                                    // flexDirection: "column-reverse",
                                    // display: "flex"
                                }}>
                                {items}
                                <div ref={messagesEndRef} />
                                </div>
                            </div>
                            
                            </Card.Body>
                            </Card>
    )
}
export default ChatDialog;