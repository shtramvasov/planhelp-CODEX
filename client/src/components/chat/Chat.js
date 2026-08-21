import formatText from "../helpers/FormatText";
import { Row, Col, Container, Card, Button, Form, Spinner, Badge } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import { wsSocket } from '../../network/WebSocket';
import { getChatDialog, getChatDialogList, postChatDialog } from "../../network/ChatNetwork";
import { setIsLoading, addChatDialogList, addChatDialog, addChatChatDialogMesageList, appendChatDialogMessage, clearExtraVariant } from "../../reducers/Chat";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { Navbar }  from "../navbar/Navbar";
import ChatDialogList from "./ChatDialogList";
import ChatDialog from './ChatDialog';
import ModalInputFile from "../helpers/ModalInputFile";
import useIsVisible from '../useIsVisible';
import useWindowActive from '../useWindowActive';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Menu, MenuItem, ListItemText } from '@mui/material';
import { getColorChatGradient, getShortChatName } from '../helpers/Chat';

moment.locale('ru');

let pauseSetTyping = false;
let stopSetTyping = true;

function Chat(props) {
    
    const { chat_id } = useParams();

    const dispatch = useDispatch()
    const Chat = useSelector((state) => state.chat);
    const User = useSelector((state) => state.user);
    const navigate = useNavigate();
    
    const chatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);
    // TODO here
    const isLoading = Chat.chatDialogStates[chat_id]?.isLoading;
    const isAllMessagesLoaded = Chat.chatDialogStates[chat_id]?.isAllMessagesLoaded;
    const chatTyping = Chat.chatDialogStates[chat_id]?.chatTyping;
    // const [isLoading, setIsLoading] = useState(false);

    const [showModalChatDialogEdit, setShowModalChatDialogEdit] = useState(false);
    const [showModalUploadFile, setShowModalUploadFile] = useState(false);

    const [chatDialogMessage,setChatDialogMessage] = useState("");

    const [offsetChatMessage, setOffsetChatMessage] = useState(null);

    const [leftContextMenu, setLeftContextMenu] = useState(null);
    const [rightContextMenu, setRightContextMenu] = useState(null);
    const [contextMessage, setContextMessage] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isReplyMode, setIsReplyMode] = useState(false);
    // const [chatTypingIntervalId, setChatTypingIntervalId] = useState(undefined);

    const [messagesStartRef, isVisibleStartRef] = useIsVisible();
    const [messagesEndRef, isVisibleEndRef] = useIsVisible();
    const messagesScrollEndRef = useRef(null);
    const messagesScrollStartRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const textAreaRef = useRef(null);
    const itemRefs = useRef({});

    const isWindowActive = useWindowActive();

    const handleLeftContextMenu = (event, message) => {
        event.preventDefault();
        setContextMessage(message);
        console.log("setContextMessage",message);
        setLeftContextMenu(
          leftContextMenu === null
            ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
            : null,
        );
    };

    const handleRightContextMenu = (event, message) => {
        event.preventDefault();
        setContextMessage(message);
        console.log("setContextMessage",message);
        setRightContextMenu(
          rightContextMenu === null
            ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
            : null,
        );
    };
    
    const handleCloseContextMenu = () => {
        setLeftContextMenu(null);
        setRightContextMenu(null);
    };

    const handleDeleteChatMessage = (e) => {
        wsSocket.socket.send(JSON.stringify({
            // action_id : crypto.randomUUID(),
            action : "chat_message_delete",
            payload : {
                chat_id,
                message_id : contextMessage.message_id
            }
        }));
        handleCloseContextMenu();
    }

    const handleReplyChatMessage = (e) => {
        handleCloseContextMenu();
        setIsReplyMode(true);
        setIsEditMode(false);
    }

    const handleEditChatMessage = (e) => {
        setChatDialogMessage(contextMessage.message_text);
        handleCloseContextMenu();
        setIsEditMode(true);
        setIsReplyMode(false);
    }

    const scrollToBottom = () => {
        messagesScrollEndRef.current?.scrollIntoView({  block: 'start' });
    };

    const scrollToItem = (id) => {
        if (itemRefs.current[id]) {
            itemRefs.current[id].scrollIntoView({
                // behavior: 'smooth',
                // top : "10",
                block: 'center',
            });
        }
    };

    useEffect(() => {
        if (isVisibleStartRef) {
            const chatDialogMessageList = Chat.chatDialogMessageList[chat_id]?Chat.chatDialogMessageList[chat_id]:[];
            const chatDialogMessageListLength = chatDialogMessageList.length;
            if (chatDialogMessageListLength > 0) {
                setOffsetChatMessage(chatDialogMessageList[1]);
            }
        } else {
            setOffsetChatMessage(null);
        }
    },[isVisibleStartRef])

    useEffect(() => {
        const currentChatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);
        if (currentChatDialog && currentChatDialog.last_message_count > 0) {
            if (User.isOnline 
                && chat_id 
                && User.isChatAuth
                && isVisibleEndRef
                && isWindowActive ) {
                actionSetChatDialogReadAll();
            }
        }
    },[Chat.chatDialogList, isVisibleEndRef, chat_id, isWindowActive]);

    useEffect(() => {
        if (!Chat.chatDialogStates[chat_id]?.isLoading && offsetChatMessage) {
            scrollToItem(offsetChatMessage.message_id);
        }
    },[Chat.chatDialogStates[chat_id]?.isLoading]);

    useEffect(() => {
	
        // getLastMessage
        if (isVisibleStartRef 
                && User.isOnline 
                && chat_id 
                && User.isChatAuth 
                && !Chat.chatDialogStates[chat_id]?.isLoading
                && !isAllMessagesLoaded) {
            console.log("ws send load messages")
            dispatch(setIsLoading({
                chat_id : chat_id,
                isLoading : true
            }));
            actionGetChatDialogMessageList();
        }
        
        if (User.isOnline 
            && chat_id 
            && User.isChatAuth ) {
            // actionSetChatDialogReadAll();
        }

    },[isVisibleStartRef, chat_id, User.isOnline, User.isChatAuth]);

    useEffect(() => {
        dispatch(clearExtraVariant({chat_id}));
    }, [chat_id])

    // если изменилось кол-во сообщений в стейте
    useEffect(() => {
        // если виден нижний элемент, то после нового сообщения - скролим вниз
        if (isVisibleEndRef && isWindowActive) {
            scrollToBottom();
        }
    }, [Chat.chatDialogMessageList[chat_id]]); // Add messages as a dependency

    const actionOnChatDialogCallback = () => {
        setShowModalChatDialogEdit(false);
        actionGetChatDialogList();
    }

    // запрос в сокет списка сообщений по текущему чату
    const actionGetChatDialogMessageList = () => {
        
        const chatDialogMessageList = Chat.chatDialogMessageList[chat_id]?Chat.chatDialogMessageList[chat_id]:[];
        const chatDialogMessageListLength = chatDialogMessageList.length;
        const offset_chat_message = chatDialogMessageList[0];
        
        wsSocket.socket.send(JSON.stringify({
            // action_id : crypto.randomUUID(),
            action : "chat_message_list",
            payload : {
                chat_id,
                offset_message_id : offset_chat_message?.message_id
            }
        }));
        // actionGetChatDialogList();
    }

    const actionSetChatDialogReadAll = () => {
        wsSocket.socket.send(JSON.stringify({
            action : "chat_read_all",
            // action_id : crypto.randomUUID(),
            payload : {
                chat_id
            }
        }));
    }

    // запрос в сокет списка моих чатов
    const actionGetChatDialogList = () => {
        wsSocket.socket.send(JSON.stringify({
            action : "chat_list",
            // action_id : crypto.randomUUID(),
            payload : {}
        }));
    }

    
    const actionSendChatTyping = (e) => {
        // если юзер набирает текст
        // то паузу снимаем через 5 сек
        // и если он продолжает набирает то снова шлем на бэк
        if (!pauseSetTyping) {
            wsSocket.socket.send(JSON.stringify({
                action : "chat_typing",
                // action_id : crypto.randomUUID(),
                payload : {
                    chat_id
                }
            }));
            pauseSetTyping = true;
            setTimeout(() => {
                pauseSetTyping = false
            }, 4000);
        }
        // clearInterval(chatTypingIntervalId);
        // chatTypingIntervalId = setTimeout(() => {
            
        // }, 1000);
    }

    // запрос в сокет отправка сообщения в чат
    const actionSendMessage = (e) => {
        const message_text = chatDialogMessage.trim();
        if (message_text === "") {
            return;
        }
        e.preventDefault();
        if (User.isOnline && User.isChatAuth) {
            wsSocket.socket.send(JSON.stringify({
                action : isEditMode ? "chat_message_edit" : "chat_message",
                // action_id : crypto.randomUUID(),
                payload : {
                    chat_id,
                    reply_message_id : isReplyMode ? contextMessage.message_id : undefined,
                    message_id : isEditMode ? contextMessage.message_id : undefined,
                    message_text : chatDialogMessage
                }
            }));
            setChatDialogMessage("");
            // actionGetChatDialogList();
            if (!isEditMode) {
                scrollToBottom();
            }
        } else {
            dispatch(addNegativeMessage("Вы офлайн, отправка сообщений невозможна"));
        }
        setContextMessage(null); 
        setIsEditMode(false);
        setIsReplyMode(false);
    }

    // Колбэк с модалки загрузки файла
    const actionUploadFileCallBack = (file) => {
        // console.log(file.name, file.url)
        setShowModalUploadFile(false);
        if (!file) {
            return;
        }
        if (User.isOnline && User.isChatAuth) {
            wsSocket.socket.send(JSON.stringify({
                action : "chat_message",
                // action_id : crypto.randomUUID(),
                payload : {
                    chat_id,
                    message_text : file.url
                }
            }));
            setChatDialogMessage("");
            // actionGetChatDialogList();
            scrollToBottom();
        } else {
            dispatch(addNegativeMessage("Вы офлайн, отправка сообщений невозможна"));
        }
    }

    const items = Chat.chatDialogMessageList[chat_id]?.map((message) => 
        <div key={message.message_id} ref={(el) => itemRefs.current[message.message_id] = el}>
        {message.login == User.profile.login ? 
            <>
            <div style={{paddingRight: "10px"}} className="d-flex justify-content-end mb-2">
            <div style={{maxWidth: "75%"}}>
                <div style={{paddingLeft: "0px"}} >
                    
                </div>
                <div className="rounded-3 shadow-sm" 
                    style={{
                        backgroundColor: "rgb(210 242 221)",
                        padding : "2px 12px 2px 12px"
                    }}>		
                    <p className="small mb-0 mt-1"><b>{message.username ? message.username : message.login}</b>
                    &nbsp;<a onClick={(e) => {handleRightContextMenu(e, message)}} style={{float : "right", color : "#555"}}href=""><i className="bi bi-chevron-down"></i></a>
                    </p>
                    {/* reply here start */}
                    {
                        message.reply_chat_message ? 
                            <div 
                                onClick={(e) => {scrollToItem(message.reply_chat_message.message_id)}}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor : "rgb(221 255 233)", 
                                    padding : "2px 12px 2px 12px",
                                    borderLeft: "2px solid rgb(170 197 180)"}}>
                                {chatDialog?.chat_type != 1 ? 
                                    <p className="small mb-0 mt-1"><b>{message.reply_chat_message.username ? message.reply_chat_message.username : message.reply_chat_message.login}</b></p>
                                    : ""
                                }
                                <small>{message.reply_chat_message.message_text.length > 206 ? 
                                        message.reply_chat_message.message_text.substr(0,206) +"..." : 
                                        message.reply_chat_message.message_text}</small>
                            </div>
                             : ""
                    }
                    {/* reply here end */}
                    <p className="small mb-0 ">{formatText(message.message_text)}</p>
                    <small><p style={{color: "gray"}} className="small  mb-0 text-end">{message.status == 1 ? " ред." : ""} {moment(message.created_at,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}</p></small>
                    {chatDialog?.discussion_allow ? 
                        <div>
                            <hr style={{fontSize: "1px solid silver", margin: "4px 0px 4px 0px"}}/>
                            <a 
                                style={{textDecoration : "none", color : "#3d3d3d"}} 
                                href={`/chat/${chat_id}_${message.message_id}`}
                                onClick={(e) => {e.preventDefault(); navigate(`/chat/${chat_id}_${message.message_id}`)}}
                            >
                            {message.child_message_count > 0 ? 
                                <Badge bg={message.extraVariant ? message.extraVariant : "secondary"}>{message.child_message_count}</Badge> 
                                    : <small><b>нет</b></small>} <small><b>комментариев</b></small>
                            </a>
                        </div>
                        : ""
                    }
                    <div style={{height:"2px"}}></div>
                </div>
                
            </div>
            </div>
            </>
        : 
            <>
            <div style={{paddingLeft: "8px"}} >
                
            </div>
            <div style={{paddingLeft: "10px"}} className="d-flex justify-content-start mb-2">
	    {message.avatar_url ? 
                <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px"}}>
                    <img className='chat-dialog-icon' src={message.avatar_url} />
                    {/* <b>{getShortChatName(chatDialog.chat_name)}</b> */}
                </div>
            :
                <div className='chat-dialog-icon' style={{float: "left" , marginRight: "6px", background : getColorChatGradient(message.user_id)}}>
                    <b>{getShortChatName(message.username ? message.username : message.login)}</b>
                </div>
            }
                <div className="rounded-3 shadow-sm" 
                    style={{
                        maxWidth: "75%", 
                        backgroundColor : "rgb(211, 230, 240)",
                        padding : "2px 12px 2px 12px"
                        }}>
                    <p className="small mb-0 mt-1"><b>{message.username ? message.username : message.login}</b>
                    <a onClick={(e) => {handleLeftContextMenu(e, message)}} style={{float : "right", color : "#555"}}href=""><i className="bi bi-chevron-down"></i></a>
                    </p>
                    {/* reply here start */}
                    {
                        message.reply_chat_message ? 
                            <div className="" 
                                onClick={(e) => {scrollToItem(message.reply_chat_message.message_id)}}
                                style={{
                                    cursor: "pointer",
                                    backgroundColor : "rgb(222 244 255)", 
                                    padding : "2px 12px 2px 12px",
                                    borderLeft: "2px solid rgb(185 204 213)"}}>
                                {/* имена юзеров в персональных чатах ненужны */}
                                {chatDialog?.chat_type != 1 ? 
                                    <p className="small mb-0 mt-1"><b>{message.reply_chat_message.username ? message.reply_chat_message.username : message.reply_chat_message.login}</b></p>
                                    : ""
                                }
                                <small>{message.reply_chat_message.message_text.length > 206 ? 
                                        message.reply_chat_message.message_text.substr(0,206) +"..." : 
                                        message.reply_chat_message.message_text}</small>
                            </div>
                             : ""
                    }
                    {/* reply here end */}
                    <p className="small mb-0">{formatText(message.message_text)}</p>
                    <small><p style={{color: "gray"}} className="small text-muted mb-0 text-end">{message.status == 1 ? " ред." : ""} {moment(message.created_at,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('LLL')}</p></small>
                    {chatDialog?.discussion_allow ? 
                        <div>
                            <hr style={{fontSize: "1px solid silver", margin: "4px 0px 4px 0px"}}/>
                            <a 
                                style={{textDecoration : "none", color : "#3d3d3d"}} 
                                href={`/chat/${chat_id}_${message.message_id}`}
                                onClick={(e) => {e.preventDefault(); navigate(`/chat/${chat_id}_${message.message_id}`)}}
                            >
                                {message.child_message_count > 0 ? 
                                <Badge bg={message.extraVariant ? message.extraVariant : "secondary"}>{message.child_message_count}</Badge> 
                                    : <small><b>нет</b></small>} <small><b>комментариев</b></small>
                            </a>
                        </div>
                        : ""
                    }
                    <div style={{height:"2px"}}></div>
                </div>
            </div>
            </>
        }
        </div>
    )

    return (<>
        <Container fluid>
        <Row>
            <Col>
                <Navbar />
                <br/>
                <Row>
                    <Col sm={3}>
                        <div className={chat_id? "d-none d-sm-block" : ""} style={{overflow: "auto", whiteSpace: "nowrap"}}>
                        <div
                            style={{
                                verticalAlign: "top",
                                minHeight : "400px",
                                height :"82vh",
                                overflow: "auto",
                                scrollbarWidth: "thin"
                            }}>
                        <ChatDialogList />
                        </div>
                        </div>
                    </Col>
                    {chat_id ? <>
                        <Col sm={9}>
                            <div className="p-3 bg-light rounded-3 border" >
                                <a href="#" onClick={(e) => { 
                                    e.preventDefault(); navigate(`/chat/${chat_id.split("_").length > 1? chat_id.split("_")[0] : ""}`); 
                                }}><i className="bi bi-arrow-left"></i></a>
                                &nbsp;&nbsp;<span style={{fontWeight: "500"}}>{chatDialog?.chat_name}</span>
                                &nbsp;{chat_id.split("_").length == 1 ? <a href="#" onClick={(e) => { e.preventDefault();setShowModalChatDialogEdit(true) }}><i className="bi bi-info-circle"></i></a> : "Комментарии к сообщению"}
                                {Chat.onLineClients[chatDialog?.with_user_id] ? <small className='text-success' style={{marginLeft: "4px"}}>онлайн</small>: ""}
                                &nbsp;{chatTyping?.user_id ? <small>{chatDialog?.chat_type==2 || !chatDialog ? chatTyping.username ? chatTyping.username : chatTyping.login : ""} печатает..</small> : ""}
                            </div>
                            <div style={{marginTop: "4px"}} ref={messagesContainerRef}>
                                <Card style={{background : "linear-gradient(rgb(255 255 255 / 95%), rgb(255 255 255 / 80%)), url('https://planhelp.ru/api/download/3/2026_2_24_10483665_photo_2026-03-24_10-47-52.jpg')"}}>
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
                                                
                                                {Chat.chatDialogStates[chat_id]?.isLoading ? <div style={{textAlign: "center", padding: "8px"}}><Spinner/></div> : ""}
                                                <div ref={messagesScrollStartRef} />
                                                <div ref={messagesStartRef} style={{height: "1px"}} />
                                                    {items}
                                                <div ref={messagesEndRef} style={{height: "1px"}} />
                                                <div ref={messagesScrollEndRef} />
                                                {/* Кнопки прокрутки */}
                                                {
                                                !isVisibleEndRef ? 
                                                    <div style={{ position: 'absolute', right: '20px', bottom: '20px', zIndex: 1000 }}>
                                                        <Button style={{borderRadius: "50%"}}
                                                            // variant="info" 
                                                            onClick={scrollToBottom}
                                                            title="Прокрутить вниз"
                                                        >
                                                            <i className="bi bi-arrow-down"></i>
                                                        </Button>
                                                        {chatDialog?.last_message_count ? 
                                                            <span 
                                                                className="position-absolute top-45 start-100 translate-middle badge rounded-pill bg-danger" 
                                                                style={{ marginTop: '5px' }} > 
                                                                { chatDialog.last_message_count }
                                                            </span>
                                                            :""}
                                                    </div> : ""
                                                }
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                            <form onSubmit={actionSendMessage}>

                            <Form.Group className="mb-3" controlId="formMessage">
                            <div style={{marginTop: "8px"}} ></div>
                            {isEditMode? 
                                <div style={{paddingBottom: "4px"}}>
                                    <small><b>Вы редактируете:</b> "{contextMessage.message_text}" 
                                    &nbsp;<a href="#" onClick={(e) => {
                                        setContextMessage(null); 
                                        setIsEditMode(false);
                                        setChatDialogMessage("");
                                    }}>Отменить</a></small>
                                </div>
                                 : ""
                            }
                            {isReplyMode? 
                                <div style={{paddingBottom: "4px"}}>
                                    <small><b>Вы отвечаете на:</b> "{contextMessage.message_text}" 
                                    &nbsp;<a href="#" onClick={(e) => {
                                        setContextMessage(null); 
                                        setIsReplyMode(false);
                                        setChatDialogMessage("");
                                    }}>Отменить</a></small>
                                </div>
                                 : ""
                            }
                            <div className="d-flex align-items-start gap-2">
                                <Form.Control
                                    ref={textAreaRef}
                                    type="text" 
                                    as="textarea"
                                    value={chatDialogMessage}
                                    onChange={(e) => {
                                        setChatDialogMessage(e.target.value);
                                        actionSendChatTyping();
                                    }}
                                    rows={2}
                                    placeholder={"Напишите ваше сообщение..."}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                                            actionSendMessage(e);
                                        } else if ((e.key === "Enter" && e.ctrlKey) || (e.key === "Enter" && e.metaKey)) {
                                            const textarea = textAreaRef.current;
                                            if (!textarea) return;
                                            const start = textarea.selectionStart;
                                            const end = textarea.selectionEnd;
                                            const newMessage = chatDialogMessage.substring(0, start) + '\n' + chatDialogMessage.substring(end);
                                            setChatDialogMessage(newMessage);
                                            setTimeout(() => {
                                                textarea.selectionStart = textarea.selectionEnd = start + 1;
                                              }, 0);
                                        }
                                    }}
                                    />     
                                <Button style={{borderRadius: "50%"}} onClick={(e) => {e.preventDefault();setShowModalUploadFile(true);}} ><i className="bi bi-paperclip"></i></Button>
                                <Button style={{borderRadius: "50%"}} type="submit"><i className="bi bi-send"></i></Button>
                            </div>
                            </Form.Group>
                            </form>
                        </Col>
                        </>
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
            <ModalInputFile 
                title={"Загрузить файл"} 
                show={showModalUploadFile} 
                callBack= {actionUploadFileCallBack}  
            />
            {/* Left menu for other */}
            <Menu
                open={leftContextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    leftContextMenu !== null
                    ? { top: leftContextMenu.mouseY, left: leftContextMenu.mouseX }
                    : undefined
                }
                slotProps={{
                    root: {
                        onContextMenu: (event) => {
                            event.preventDefault();
                            handleCloseContextMenu();
                        },
                    },
                }}
            >
                <MenuItem onClick={handleReplyChatMessage}>Ответить</MenuItem>
            </Menu>
            {/* Right menu for me */}
            <Menu
                open={rightContextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    rightContextMenu !== null
                    ? { top: rightContextMenu.mouseY, left: rightContextMenu.mouseX }
                    : undefined
                }
                slotProps={{
                    root: {
                        onContextMenu: (event) => {
                            event.preventDefault();
                            handleCloseContextMenu();
                        },
                    },
                }}
            >
                <MenuItem onClick={handleReplyChatMessage}>Ответить</MenuItem>
                <hr style={{margin : "4px"}}/>
                <MenuItem onClick={handleEditChatMessage}>Редактировать</MenuItem>
                <MenuItem onClick={handleDeleteChatMessage}>Удалить</MenuItem>
            </Menu>
        </>
    )
}
export default Chat;