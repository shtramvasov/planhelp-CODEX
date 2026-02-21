import { Row, Col, Container, Card, Button, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";

import { getChatDialog, getChatDialogList, postChatDialog } from "../../network/ChatNetwork";
import { addChatDialogList, addChatDialog } from "../../reducers/Chat";
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
    const navigate = useNavigate();
    
    const chatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);

    const [showModalChatDialogEdit, setShowModalChatDialogEdit] = useState(false);

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

    return (<>
        <Container fluid>
        <Row>
            <Col>
                <Navbar />
                <br/>
                <Row>
                    <Col lg={3}>
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
                        <Col lg={9}>
                            <div class="p-3 bg-light rounded-3 border" >
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/chat/`); }}><i class="bi bi-arrow-left"></i></a>
                                &nbsp;&nbsp;<span style={{fontWeight: "500"}}>{chatDialog?.chat_name}</span>
                                {chatDialog?.chat_type == 2 ? <>&nbsp;<a href="#" onClick={(e) => { e.preventDefault();setShowModalChatDialogEdit(true) }}><i class="bi bi-info-circle"></i></a> </>: ""}
                                
                            </div>
                            <div style={{marginTop: "4px"}}>
                                <DialogMessageList />
                            </div>
                            <div style={{marginTop: "8px"}} className="d-flex align-items-start gap-2">
                                <Form.Control
                                    type="text" as="textarea"
                                    rows={2}
                                    placeholder={"Напишите ваше сообщение..."}
                                    />     
                                
                                <Button>Отправить</Button>
                            </div>
                            
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