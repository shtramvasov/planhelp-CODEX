import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMatch, useNavigate , useParams} from "react-router-dom";
import { wsSocket } from '../../network/WebSocket';
import { postChatDialog, postChatDialogUser } from "../../network/ChatNetwork";
import { setIsLoading } from "../../reducers/Chat";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import { Navbar }  from "../navbar/Navbar";
import { messages } from "../constants/Msg";
import ChatDialog from './ChatDialog';
import ModalInputFile from "../helpers/ModalInputFile";
import useIsVisible from '../useIsVisible';
import useWindowActive from '../useWindowActive';
import moment from 'moment-timezone';
import 'moment/locale/ru';
import { Box, Grid, Card, useTheme, Typography, Avatar, Badge, IconButton, Tooltip, TextField, InputAdornment, Divider, Chip, Fade, Slide, LinearProgress, lighten, ClickAwayListener } from '@mui/material';
import { AddBoxRounded, ArrowBackRounded, ArrowDownwardRounded, AttachFile, CloseRounded, CommentRounded, CommentsDisabledRounded, EditRounded, EmojiEmotionsOutlined, LogoutRounded, NotificationsOffRounded, NotificationsRounded, PersonAddAltRounded, ReplyRounded, SaveAltRounded, SearchRounded, Send } from "@mui/icons-material";
import { getMessageMetaData, getShortChatName, getUserGradient, getUsername } from './chat.utils';
import { ReactComponent as ChatBodyEmptyImg } from '../../resources/img/chat-body-empty.svg';
import ChatPatternImg from '../../resources/img/chat-pattern.png';
import EmojiPicker from 'emoji-picker-react';
import ru from 'emoji-picker-react/dist/data/emojis-ru';
import { getUsers } from "../../network/UserNetwork";
import { addUserList } from "../../reducers/User";
import { getDeclension } from "../helpers/getDeclension";
import ModalOneInputText from "../helpers/ModalOneInputText";
import ModalAutoComplete from "../helpers/ModalAutoComplete";
import customEmojisData from './emojis.data.json';
import { ChatDialogItem, ChatHeaderSkeleton, ChatMessageItem, ChatNotFoundSkeleton, CreateNewChatMenu, MessageContextMenu, OnlineUsersInChatMenu, TypingUsers, MentionUserListMenu } from "./components";
import { actionChangeDiscussionSwitch, actionChangeNotifySwitch, actionDelUser, actionGetChatDialogList, actionGetChatDialogMessageList, actionLeaveChat, actionNewChatDialogName, actionSendChatTyping, actionSetChatDialogReadAll, copyTextToClipboard, fetchChatDialog, fetchUploadFile, handleDeleteChatMessage } from "./actions";
moment.locale('ru');


function BetterChat(props) {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const theme = useTheme();

  const { chat_id } = useParams();

  const Chat = useSelector((state) => state.chat);
  const User = useSelector((state) => state.user);
    
  // Переменные
  const chatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);  
  const isLoading = Chat.chatDialogStates[chat_id]?.isLoading;
  const isAllMessagesLoaded = Chat.chatDialogStates[chat_id]?.isAllMessagesLoaded;
  const totalUsers = Chat.chatDialog?.chat_user_list?.length || 0;
  const onlineUsers = Chat.chatDialog?.chat_user_list?.filter(user => Chat.onLineClients?.[user.user_id] === true) || [];

  // Стейты
  const [showModalChatDialogEdit, setShowModalChatDialogEdit] = useState(false);
  const [showModalUploadFile, setShowModalUploadFile] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [chatDialogMessage,setChatDialogMessage] = useState("");
  const [contextMessage, setContextMessage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchChatList, setSearchChatList] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineAnchorEl, setOnlineAnchorEl] = useState(null);
  const [createNewChatEl, setCreateNewChatEl] = useState(null);
  const [messageContext, setMessageContext] = useState(null);
  const [discussionChat, setDiscussionChat] = useState({ isDiscussion: false, messages_count: null })
  const [isReplyMode, setIsReplyMode] = useState(false); 
  const [wasAtBottom, setWasAtBottom] = useState(true);
  const [showModalCreateGroupDialogChat, setShowModalCreateGroupDialogChat] = useState(false);
  const [showModalCreatePersonalDialogChat, setShowModalCreatePersonalDialogChat] = useState(false);
  const [showModalAddUserDialogChat, setShowModalAddUserDialogChat] = useState(false);
  const [newChatType, setNewChatType] = useState(1);
  const [chatNameEditMode, setChatNameEditMode] = useState({ isEdit: false, chat_name: '' });
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMessageContext, setIsMessageContext] = useState({
    isMyMessage:  false,
    message_text: '',
    message_id:   undefined,
    message_from: '',
  });

  const filteredChats = Chat.chatDialogList.filter((chatDialog) => { 
    return chatDialog.chat_name?.toUpperCase().includes(searchChatList.toUpperCase())
  })
    

  // Рефы
  const createNewChatOpen = Boolean(createNewChatEl);
  const messageContextOpen = Boolean(messageContext);
  const onlineOpen = Boolean(onlineAnchorEl);

  const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
  const mentionOpen = Boolean(mentionAnchorEl);
  const [mentionQuery, setMentionQuery] = useState('');


  const pauseSetTyping = useRef(false);
  const emojiPickerRef = useRef(null);
  const savedRangeRef = useRef(null);
  const isLoadingInProgressRef = useRef(false);
  const isTopReachedRef = useRef(false);
  const messagesScrollStartRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const itemRefs = useRef({});

  const [messagesStartRef, isVisibleStartRef] = useIsVisible();
  const [messagesEndRef, isVisibleEndRef] = useIsVisible();

  const isWindowActive = useWindowActive();

  const handleNavigate = (messageId = null, messages_count = null) => {
    const isDiscussion = chat_id.includes('_');
    const parentChatId = chat_id.split("_")[0];

    if (messageId) {
      // Переход в обсуждение (из корневого чата)
      const discussionId = `${chat_id}_${messageId}`;
      setDiscussionChat({ isDiscussion: true, messages_count });
      navigate(`/better_chat/${discussionId}`);
    } else if (isDiscussion) {
      // Возврат из обсуждения в корневой чат
      setDiscussionChat({ isDiscussion: true, messages_count });
      navigate(`/better_chat/${parentChatId}`);
    } else {
      // Возврат из корневого чата на главную
      setDiscussionChat({ isDiscussion: false, messages_count: null });
      navigate(`/better_chat`);
    }
  }

  useEffect(() => {
    const handleGlobalPaste = (event) => {
      const items = event.clipboardData.items;
    
      for (let item of items) {      
          if (item.type.indexOf('image/') === 0 || 
              item.type.indexOf('application/') === 0) {
              
              const file = item.getAsFile();
              
              if (file) {
                  event.preventDefault();
                  dispatch(fetchUploadFile(file, chat_id, { afterUpload: () => scrollToBottom()}));
                  break;
              }
          }
        }
    };
  
    document.addEventListener('paste', handleGlobalPaste);   
    return () => {
        document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [fetchUploadFile, chat_id]);


  const messages = Chat.chatDialogMessageList[chat_id] || [];


  const preparedMessages = useMemo(() => {
    return messages.map((message, index) => ({
      message,
      metadata: getMessageMetaData({
        messages,
        index,
        message,
        currentUserId: User.profile.user_id,
        chatDialog
      })
    }));
  }, [messages, User.profile.user_id, chatDialog]);
        

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) savedRangeRef.current = selection.getRangeAt(0).cloneRange();     
  };

  const handleCopyChatMessage = async  (message_text) => {
    await copyTextToClipboard(message_text, savedRangeRef.current);

    dispatch(addPositiveMessage('Текст скопирован'));
    savedRangeRef.current = null;
    setIsMessageContext({ isMyMessage: false, message_id: undefined, message_text: '', message_from: '' })
    setMessageContext(null)
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setWasAtBottom(true);
      } else if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        setWasAtBottom(true);
      }
    });
  };

  const isScrolledToBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    return scrollHeight - scrollTop - clientHeight < 50;
  }
  
  const actionNewUserAdd = (user_id) => {
    setShowModalAddUserDialogChat(false);
    if (!user_id) return;
    postChatDialogUser({ chat_id, user_id, user_role : "WRITE" }, (err, resp) => {
        if (!err) {
            dispatch(addPositiveMessage(messages.SUCCESS));
            dispatch(fetchChatDialog(chat_id));
        } else {
            dispatch(addNegativeMessage(err));
        }
    })
  }

  const actionNewChatCallBack = (payload) => {
    setShowModalCreateGroupDialogChat(false);
    setShowModalCreatePersonalDialogChat(false);
    if (!payload) return;
    postChatDialog(
      {
        chat_type : newChatType,
        chat_name : newChatType == 1 ? "" : payload,
        user_id : newChatType == 1 ? payload : undefined 
      }, 
      (err,resp) => {
          if (!err) {
              actionGetChatDialogList();
              dispatch(addPositiveMessage(messages.SUCCESS));
          } else {
              dispatch(addNegativeMessage(err));
          }
      }
    );
  }

  const fetchUsers = (search, cb) => {
    if (search) {
        getUsers({search}, (err,resp) => {
          resp.map((el) => { el.display_val = el.login; el.return_val = el.user_id;})
          dispatch(addUserList(resp));
        })
    } else {
        dispatch(addUserList([]));
    }
  }

  useEffect(() => {
    if (chatDialog?.chat_id == chat_id && chatDialog?.chat_type == 2) {
      dispatch(fetchChatDialog(chat_id));
    }
  }, [chat_id, chatDialog])

  useEffect(() => {
    const currentChatDialog = Chat.chatDialogList.find((chatDialog) => chatDialog.chat_id == chat_id);
    if (currentChatDialog && currentChatDialog.last_message_count > 0) {
      if (User.isOnline && chat_id && User.isChatAuth && isVisibleEndRef&& isWindowActive ) actionSetChatDialogReadAll(chat_id);     
    }
  },[Chat.chatDialogList, isVisibleEndRef, chat_id, isWindowActive]);

  useEffect(() => {
    if (isVisibleStartRef && User.isOnline && chat_id && User.isChatAuth && !Chat.chatDialogStates[chat_id]?.isLoading && !isAllMessagesLoaded) {
      dispatch(setIsLoading({ chat_id : chat_id, isLoading : true }));
      dispatch(actionGetChatDialogMessageList({ chat_id }));
    }
  },[isVisibleStartRef, chat_id, User.isOnline, User.isChatAuth]);

  // если изменилось кол-во сообщений в стейте
  useEffect(() => {
    if (Chat.chatDialogMessageList[chat_id]?.length > 0 && wasAtBottom && isWindowActive) scrollToBottom()     
  }, [Chat.chatDialogMessageList[chat_id]?.length]);

  const actionOnChatDialogCallback = () => {
    setShowModalChatDialogEdit(false);
    actionGetChatDialogList();
  }

  useEffect(() => {
    setWasAtBottom(true);
    isLoadingInProgressRef.current = false;
    isTopReachedRef.current = false;
  }, [chat_id]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = isScrolledToBottom();
      setWasAtBottom(isNearBottom);
      setShowScrollDownButton(!isNearBottom);

      if (isLoadingInProgressRef.current || isLoadingMore || Chat.chatDialogStates[chat_id]?.isLoading || isAllMessagesLoaded) return;

      if (container.scrollTop <= 50) {
        if (isTopReachedRef.current) return;

        const chatDialogMessageList = Chat.chatDialogMessageList[chat_id] || [];
        const oldestMessage = chatDialogMessageList[0];

        if (!oldestMessage) return;

        isTopReachedRef.current = true;
        isLoadingInProgressRef.current = true;
        setIsLoadingMore(true);

        const firstMessageId = oldestMessage.message_id;

        wsSocket.socket.send(JSON.stringify({
          action_id: crypto.randomUUID(),
          action: "chat_message_list",
          payload: { chat_id, offset_message_id: oldestMessage.message_id }
        }));

        const checkInterval = setInterval(() => {
          if (!Chat.chatDialogStates[chat_id]?.isLoading) {
            clearInterval(checkInterval);

            requestAnimationFrame(() => {
              const el = itemRefs.current[firstMessageId];
              if (el) el.scrollIntoView({ block: 'start' });         
            });

            isLoadingInProgressRef.current = false;
            isTopReachedRef.current = false;
            setIsLoadingMore(false);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          isLoadingInProgressRef.current = false;
          isTopReachedRef.current = false;
          setIsLoadingMore(false);
        }, 5000);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chat_id, isLoadingMore, isAllMessagesLoaded, Chat.chatDialogStates[chat_id]?.isLoading, Chat.chatDialogMessageList[chat_id]?.length]);

  useEffect(() => {
  if (chat_id && Chat.chatDialogMessageList[chat_id] && Chat.chatDialogMessageList[chat_id].length > 0) {
    
    if(isLoading) return;

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }
  }, [chat_id, isLoading]);

  // запрос в сокет отправка сообщения в чат
  const actionSendMessage = (e, customMessage = null) => {
    const message_text = (customMessage || chatDialogMessage).trim();
    if (message_text === "") return;
      
    if (e && e.preventDefault) e.preventDefault();
    if (User.isOnline && User.isChatAuth) {
        wsSocket.socket.send(JSON.stringify({
            action : isEditMode ? "chat_message_edit" : "chat_message",
            action_id : crypto.randomUUID(),
            payload : {
                chat_id,
                reply_message_id : isReplyMode ? isMessageContext.message_id : undefined,
                message_id : isEditMode ? isMessageContext.message_id : undefined,
                message_text : message_text  
            }
        }));

        setIsMessageContext({ isMyMessage: false, message_id: undefined, message_text: '', message_from: '' })
        setChatDialogMessage("");
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
    setShowModalUploadFile(false);
    if (!file) return;
    
    if (User.isOnline && User.isChatAuth) {
        wsSocket.socket.send(JSON.stringify({
            action : "chat_message",
            action_id : crypto.randomUUID(),
            payload : { chat_id, message_text : file.url }
        }));
        setChatDialogMessage("");
        scrollToBottom();
    } else {
        dispatch(addNegativeMessage("Вы офлайн, отправка сообщений невозможна"));
    }
  }

  const onChatDialogClick = (e, chat_id, chat_type) => {
    e.preventDefault();
    navigate(`/better_chat/${chat_id}`);
    setChatDialogMessage('')
  }

  const createPersonalChat = async () => {
    setNewChatType(1);
    setCreateNewChatEl(null)
    setShowModalCreatePersonalDialogChat(true);    
    dispatch(addUserList([]));
  }

  const createGroupChat = async () => {
    setCreateNewChatEl(null)
    setNewChatType(2);
    setShowModalCreateGroupDialogChat(true);
  }

  const insertMention = (user) => {
    setChatDialogMessage((prev) =>
      prev.replace(/@([a-zA-Z0-9а-яА-Я_]*)$/, `@${user.login} `)
    );

    setMentionAnchorEl(null);
  };

  return (
    <>
    <Box sx={{ px: { md: 0, lg: '12px' }, mx: 'auto' }}>
      <Box>
        <Row><Col><Navbar /></Col></Row>
      </Box>

      <Card variant="outlined" sx={{ mt: 1, p: 0, display: 'flex', flexDirection: 'column', borderRadius: 1.5, boxShadow: (theme) => theme.shadows[1] }}>
        <Grid 
          sx={{
            display: 'grid',
            transition: 'grid-template-columns 0.3s ease',
            gridTemplateColumns: { xs: chat_id ? '0fr 1fr' : '1fr 0fr', md: chat_id ? '0fr 1fr' : '1fr 0fr', lg: 'minmax(0, 3fr) 10fr' },
            height: { lg: '92vh', xs: '92vh' },
          }}
        >
          
        {/* Колонка списка чатов */}
          <Grid 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRight: '1px solid',
              borderColor: theme.palette.grey[100],
              background: `linear-gradient(to top, ${theme.palette.grey[50]} 0%, white 50%)`,
              overflow: 'hidden',
            }}
          >
            <Grid sx={{ flexShrink: 0, p: 2 }}>
              {!User.profile?.login 
                ? (<ChatHeaderSkeleton />) 
                : (
                  <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Badge color={User.isOnline ? 'success' : 'error'} variant="dot" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: '2px solid white' }}}
                    >
                      <Avatar 
                        src={User.profile.avatar_url} 
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          background: User.profile.avatar_url ? 'transparent' : getUserGradient(theme, User.profile.user_id),                         
                          '& img': { objectFit: 'cover', objectPosition: 'center'} 
                        }}
                      >
                        {getShortChatName(getUsername(User.profile.username, User.profile.login))}
                      </Avatar>
                    </Badge> 

                    <Grid item sx={{ flex: 1, minWidth: 0, pl: 1.5 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1, fontWeight: 600, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getUsername(User.profile.username, User.profile.login)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 12, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {User.profile.email}
                      </Typography>
                    </Grid>  

                    <Tooltip title='Создать новый чат' placement="top">
                      <IconButton onClick={(event) => setCreateNewChatEl(event.currentTarget)} sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}>
                        <AddBoxRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                      </IconButton>
                    </Tooltip>

                    <CreateNewChatMenu 
                      open={createNewChatOpen}
                      anchorEl={createNewChatEl}
                      onClose={() => setCreateNewChatEl(null)}
                      createPersonalChat={createPersonalChat}
                      createGroupChat={createGroupChat}
                    />
                  </Grid>
              )}

              <Grid sx={{ mb: 3, display: 'flex' }}>
                <TextField 
                  fullWidth
                  placeholder="Искать контакт"
                  onChange={(e) => setSearchChatList(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"><SearchRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, mt: 0.5 }} /></InputAdornment>
                      ),
                    },
                  }}              
                />
              </Grid>
              <Divider flexItem sx={{ bgcolor: theme.palette.grey[400], mt: -1, mb: 1 }} />
            </Grid>

            {/* Прокручиваемый список чатов */}
            <Grid 
              ref={messagesScrollStartRef}
              sx={{ mt: -1, pb: 1, px: 1,
                flex: 1, gap: 0.25,
                position: 'relative', overflow: 'auto', display: 'flex', flexDirection: 'column', 
                scrollbarWidth: "thin", transition: 'scrollbar-color 0.3s',
                '&:not(:hover)': { scrollbarColor: 'transparent transparent' },
                scrollbarColor: `${theme.palette.grey[200]} transparent`,
              }}
            >
              {!Chat.chatDialogList.length && ( <Box sx={{ width: 'auto' }}><LinearProgress color="primary"  sx={{ height: '3px' }} /></Box>)}

              {filteredChats.length === 0 && searchChatList 
                ? ( <ChatNotFoundSkeleton searchChatList={searchChatList} />) 
                : 
                  (filteredChats.map((chatDialog) => (
                    <ChatDialogItem chat_id={chat_id} chatDialog={chatDialog} onChatDialogClick={onChatDialogClick} />))
                  )}
            </Grid>
          </Grid>       

          {/* Колонка чата */}
          <Grid
            ref={messagesStartRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRight: '1px solid',
              borderColor: chat_id ? theme.palette.grey[100] : 'transparent',
              position: 'relative',
              overflow: 'hidden',
              scrollbarWidth: "thin",
              transition: 'scrollbar-color 0.3s',
              '&:not(:hover)': { scrollbarColor: 'transparent transparent' },
              scrollbarColor: `${theme.palette.grey[200]} transparent`,
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(to top, rgba(255,255,255, 0) 0%, rgba(255,255,255,0.6) 100%), url(${ChatPatternImg})`,
                backgroundRepeat: 'no-repeat, repeat',
                backgroundSize: {
                  xs: '100% 100%, 100% auto',
                  sm: '100% 100%, 80% auto',
                  md: '100% 100%, 35% auto',
                },
                opacity: 0.15,
                pointerEvents: 'none',
              },
            }}
          >

            {(isLoading || isLoadingMore) && (
              <Box sx={{ width: '100%' }}><LinearProgress color="primary"  sx={{ height: '3px' }} /></Box>
            )}


            {chat_id && !isLoading && (
              <Grid sx={{  position: 'relative', zIndex: 100, borderBottom: `1px solid`, borderColor: theme.palette.grey[100], bgcolor: 'white', flexShrink: 0 }}>
                <Grid 
                  sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', transition: 'all 0.2s', bgcolor: 'white', p: 1.5,
                    justifyContent: 'space-between',
                    background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.7)} 0%, white 75%)`,
                  }}
                >
                  <Grid sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Tooltip title={'Перейти назад'} placement="top">
                      <IconButton onClick={(e) => { e.preventDefault(); handleNavigate() }} sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}>
                        <ArrowBackRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                      </IconButton>
                    </Tooltip>
                      {chat_id.includes('_') && (
                        <Grid>
                          <Typography>Обсуждение</Typography>
                          <Typography></Typography>
                        </Grid>
                      )}

                      {chatDialog && (
                        <Grid sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                          <Grid item sx={{ flexShrink: 0 }}>
                            <Badge 
                              color={'success'} 
                              invisible={chatDialog?.chat_type === 2 || !Chat.onLineClients[chatDialog?.with_user_id]} 
                              variant="dot" 
                              overlap="circular" 
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: '2px solid white' }}}
                            >
                              <Avatar 
                                src={chatDialog?.avatar_url} 
                                sx={{ 
                                  width: 42, 
                                  height: 42, 
                                  fontSize: 17,
                                  fontWeight: 500,
                                  background: chatDialog?.chat_type == 1 ? getUserGradient(theme, chatDialog?.with_user_id ?? chatDialog?.user_id) : 'transtarent',
                                  '& img': { objectFit: 'cover', objectPosition: 'center'} 
                                }}
                              >
                                {getShortChatName(chatDialog?.chat_name)}
                              </Avatar>
                            </Badge> 
                          </Grid> 

                          <Grid item sx={{ flex: 1, minWidth: 0 }}>
                            <Grid sx={{ display: 'flex', alignItems: 'center' }}>
                              {chatDialog.notify_status == 0 && <NotificationsOffRounded sx={{ fill: theme.palette.grey[500], fontSize: 16, m: 0.5 }} /> }
                              
                              {chatNameEditMode.isEdit && (
                                <TextField
                                  fullWidth
                                  placeholder="Введите название чата..."
                                  value={chatNameEditMode.chat_name}
                                  onChange={(e) => {
                                    setChatNameEditMode((prev) => ({ ...prev, chat_name: e.target.value }))
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      dispatch(actionNewChatDialogName(chat_id, chatNameEditMode.chat_name))
                                      setChatNameEditMode({ isEdit: false, chat_name: chatDialog.chat_name })
                                    }
                                    if (e.key === 'Escape') {
                                      setChatNameEditMode({ isEdit: false, chat_name: chatDialog.chat_name });
                                    }
                                  }}
                                  variant="standard"
                                  size="small"
                                  autoFocus
                                  slotProps={{
                                      input: {
                                        endAdornment: (
                                          <InputAdornment position="end" sx={{ gap: 0.2 }}>
                                            <Tooltip title='Сохранить' placement="top">
                                                <IconButton 
                                                  onClick={() => {
                                                    dispatch(actionNewChatDialogName(chat_id, chatNameEditMode.chat_name))
                                                    setChatNameEditMode({ isEdit: false, chat_name: chatDialog.chat_name })
                                                  }}
                                                  sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 24, width: 24, '&:hover svg': { fill: theme.palette.primary.main } }}
                                                >
                                                  <SaveAltRounded sx={{ fill: theme.palette.grey[400], fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title='Отменить' placement="top">
                                              <IconButton 
                                                  onClick={() => {setChatNameEditMode({ isEdit: false, chat_name: chatDialog.chat_name })}}
                                                  sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 24, width: 24, '&:hover svg': { fill: theme.palette.error.light } }}
                                                >
                                                  <CloseRounded sx={{ fill: theme.palette.grey[400], fontSize: 14 }} />
                                                </IconButton>
                                            </Tooltip>                         
                                          </InputAdornment>
                                        ),
                                      },
                                    }}
                                    sx={{
                                      width: 450,
                                      '& .MuiInput-root': { '&:before': { borderBottomColor: theme.palette.grey[200] },
                                      '&:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.grey[300] },
                                      '&:after': { borderBottomColor: theme.palette.info.main } },
                                    }}
                                />
                              )}

                              {!chatNameEditMode.isEdit && (
                                <Tooltip title={(chatDialog.user_role === 'OWNER' && chatDialog.chat_type == 2) ? 'Редактировать название чата' : ''} placement="top">
                                  <Typography 
                                    onClick={() => (chatDialog.user_role === 'OWNER' && chatDialog.chat_type == 2) && setChatNameEditMode({ chat_name: chatDialog.chat_name, isEdit: true })}
                                    variant="body2" 
                                    sx={{ 
                                      transition: 'all 0.3s ease-in-out',
                                      fontWeight: 600, 
                                      color: theme.palette.grey[700], 
                                      cursor: (chatDialog.user_role === 'OWNER' && chatDialog.chat_type == 2) ? 'pointer' : 'default',
                                      '&:hover': {
                                        color: (chatDialog.user_role === 'OWNER' && chatDialog.chat_type == 2) ? theme.palette.primary.main : theme.palette.grey[700]
                                      },
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {chatDialog?.chat_name}
                                  </Typography> 
                                </Tooltip>
                              )}

                            </Grid>
                              {Object.keys(Chat.chatDialogStates?.[chatDialog?.chat_id]?.chatTyping || {}).length > 0 ? (
                                <TypingUsers
                                  typingData={Chat.chatDialogStates?.[chatDialog?.chat_id]?.chatTyping}
                                  chatType={chatDialog.chat_type}
                                />
                                ) : chatDialog?.chat_type === 1 ? null : (
                                  <>
                                    <Grid sx={{ display: 'flex', gap: 0.5 }}>
                                      <Typography variant="body2" sx={{ color: theme.palette.grey[500], fontSize: 12, pt: 0.25 }}>
                                        {totalUsers} {getDeclension(totalUsers, 'участник', 'участника', 'участников')},
                                      </Typography>

                                      <Tooltip title="Посмотреть участников в сети" placement="top-start">
                                        <Typography
                                          onClick={(event) => setOnlineAnchorEl(event.currentTarget)}
                                          variant="body2"
                                          sx={{color: theme.palette.primary.main, cursor: 'pointer', fontSize: 12, pt: 0.25, '&:hover': { color: theme.palette.primary.dark }}}
                                        >
                                          {onlineUsers.length} в сети
                                        </Typography>
                                      </Tooltip>
                                    </Grid>

                                    <OnlineUsersInChatMenu
                                      open={onlineOpen}
                                      anchorEl={onlineAnchorEl}
                                      onClose={() => setOnlineAnchorEl(null)}
                                    />
                                  </>
                                )}
                          </Grid> 
                        </Grid>
                      )}
                  </Grid>

                  <Grid sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {(chatDialog?.chat_type == 2) && (
                      <Tooltip title={'Добавить пользователя'} placement="top">
                        <IconButton 
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(addUserList([]));
                            setShowModalAddUserDialogChat(true);
                          }}
                          sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}
                        >
                          <PersonAddAltRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title={chatDialog?.notify_status == 1 ? 'Выключить уведомления' : 'Включить уведомления'} placement="top">
                      <IconButton onClick={() => dispatch(actionChangeNotifySwitch(chat_id, chatDialog?.notify_status == 1 ? 0 : 1))} sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}>
                        {chatDialog?.notify_status == 1 && <NotificationsOffRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />}
                        {chatDialog?.notify_status == 0 && <NotificationsRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />}
                      </IconButton>
                    </Tooltip> 

                    {chatDialog?.user_role === 'OWNER' && (
                      <Tooltip title={chatDialog?.discussion_allow == 1 ? 'Запретить дискуссии' : 'Разрешить дискуссии'} placement="top">
                        <IconButton onClick={() => dispatch(actionChangeDiscussionSwitch(chat_id, chatDialog?.discussion_allow == 1 ? 0 : 1))} sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}>
                          {chatDialog?.discussion_allow == 1 &&  <CommentsDisabledRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />}
                          {chatDialog?.discussion_allow == 0 && <CommentRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />}
                        </IconButton>
                      </Tooltip> 
                    )}  

                    <Tooltip title='Выйти из чата' placement="top">
                        <IconButton 
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(actionLeaveChat(User.profile.user_id, chat_id));
                            handleNavigate()
                          }}
                          sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}
                        >
                          <LogoutRounded sx={{ fill: lighten(theme.palette.error.light, 0.2), fontSize: 18, m: 0.5 }} />
                        </IconButton>
                    </Tooltip>
                  </Grid>

                </Grid>
              </Grid>
              )}
            <Grid ref={messagesContainerRef}sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, p: 2 }}>
              
              {/* Колонка сообщений чата */}
              {((!chat_id || !Chat.chatDialogMessageList[chat_id] && !isLoading)) && (
                <Grid sx={{ zIndex: 100, display: 'flex',  height: '100%',  minHeight: 0,  alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <Grid 
                    sx={{ p: 6, pt: 2.5, display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', border: '1px solid', borderColor: theme.palette.grey[100], borderRadius: 1,   
                      position: 'relative', bgcolor: 'white',
                      background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.7)} 0%, white 15%)`,
                    }}
                  >

                    {/* Выберите чат чтобы начать общение */}
                    {!chat_id && (
                      <>
                      <ChatBodyEmptyImg />
                      <Typography variant="body2" sx={{ lineHeight: 0.7, fontSize: 14, color: theme.palette.grey[600], fontWeight: 600 }}>
                        Выберите чат чтобы начать общение
                      </Typography>
                      </>
                    )}

                    {/* Здесь пока ничего нет */}
                    {(chat_id && !Chat.chatDialogMessageList[chat_id] && !isLoading) && (
                      <Grid sx={{ display: 'flex', mt: 2, flexDirection: 'column', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: 14, color: theme.palette.grey[600], fontWeight: 600 }}>Здесь пока ничего нет </Typography>
                        <Typography variant="body2" sx={{ fontSize: 12, color: theme.palette.grey[600] }}>Отправьте сообщение или нажмите на приветствие ниже</Typography>

                        <Grid sx={{ flexWrap: 'wrap', display: 'flex', flexDirection: 'column', gap: 0.7, pt: 3.5,  alignItems: 'center' }}>
                          <Chip 
                            sx={{ '&:hover': { bgcolor: theme.palette.grey[200] } }}
                            onClick={(e) => { actionSendMessage(e, `Это не баг, это фича 🐛✨`)}}
                            label={'Привет! Это не баг, а фича 🐛✨'}
                          />
                          <Chip 
                            sx={{ '&:hover': { bgcolor: theme.palette.grey[200] } }}
                            onClick={(e) => { actionSendMessage(e, `Интернет есть, а МП не работает? 🤡`)}}
                            label={`Интернет есть, а МП не работает? 🤡`}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
              {/* Список сообщений */}
              {(chat_id && Chat.chatDialogMessageList[chat_id] && !isLoading) && (
                <Grid sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {preparedMessages.map(({ message, metadata }, index) => (
                    <ChatMessageItem
                      key={message.message_id}
                      message={message}
                      metadata={metadata}
                      index={index}
                      itemRefs={itemRefs}
                      setHoveredMessageId={setHoveredMessageId}
                      handleMouseUp={handleMouseUp}
                      setMessageContext={setMessageContext}
                      setIsMessageContext={setIsMessageContext}
                      setIsReplyMode={setIsReplyMode}
                      handleNavigate={handleNavigate}
                    />
                  ))}
                </Grid>
              )}
            </Grid> 

            <MessageContextMenu
              open={messageContextOpen}
              anchorEl={messageContext}
              chat_id={chat_id}
              isMessageContext={isMessageContext}
              onClose={() => setMessageContext(null)}
              onReply={() => setIsReplyMode(true)}
              onEdit={(msg) => {
                setChatDialogMessage(msg.message_text);
                setIsEditMode(true);
              }}
              onCopy={(text) => handleCopyChatMessage(text)}
              onDelete={(chatId, messageId) => {
                handleDeleteChatMessage(chatId, messageId);
                setIsMessageContext({ isMyMessage: false, message_id: undefined, message_text: '',  message_from: '' });
                setMessageContext(null);
              }}
            />

            <div ref={messagesEndRef} style={{height: "1px"}} />                  
            
            {chat_id && (
            <Grid 
              sx={{ 
                zIndex: 100,
                p: 1.5,
                borderTop: `1px solid`,
                borderColor: theme.palette.grey[100],
                bgcolor: 'white',
                background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.7)} 0%, white 75%)`,    
              }}
              >
              <Grid sx={{ zIndex: 100, position: 'relative', display: 'flex', gap: 1, alignItems: 'flex-end', transition: 'all 0.2s' }}>
                {(isEditMode || isReplyMode) && (
                  <Grid
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      zIndex: -1,
                      p: 2,
                      py: 1,
                      bgcolor: 'white',
                      width: 'auto',
                      position: 'absolute',
                      top: -35,
                      left: -16,
                      right: -16,
                      borderTop: '1px solid',
                      borderColor: theme.palette.grey[100],
                      background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.7)} 0%, white 75%)`, 
                    }}
                  >
                    <Grid sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {isEditMode && <EditRounded sx={{ fill: theme.palette.primary.dark, fontSize: 20 }} />} 
                      {isReplyMode && <ReplyRounded sx={{ fill: theme.palette.primary.dark, fontSize: 20 }} />} 
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.dark }}>
                        {isEditMode && 'Редактирование'}
                        {isReplyMode && `Вы отвечаете ${isMessageContext.message_from}`}
                      </Typography>
                    </Grid>

                    <Tooltip title="Отменить" placement="top">
                      <IconButton 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(isEditMode) setChatDialogMessage('');
                            
                            setIsEditMode(false);
                            setIsReplyMode(false)
                          }}
                        sx={{
                          border: 'none', 
                          borderRadius: 1, 
                          transition: 'all 0.3s ease-in-out', 
                          height: 26, 
                          width: 26, 
                          p: 0.25, 
                          '&:hover svg': { fill: theme.palette.error.light }
                        }}
                      >
                        <CloseRounded sx={{ fill: showEmojiPicker ? theme.palette.primary.main : theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )}

                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Введите сообщение..."
                  value={chatDialogMessage}
                  onChange={(e) => {
                    actionSendChatTyping(chat_id, pauseSetTyping);

                    const value = e.target.value;
                    setChatDialogMessage(value);

                    const match = value.match(/@([a-zA-Z0-9а-яА-Я_]*)$/);

                    if (match) {
                      setMentionQuery(match[1]);

                      if (!mentionAnchorEl) {
                        setMentionAnchorEl(e.currentTarget);
                      }
                    } else {
                      setMentionAnchorEl(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      actionSendMessage(e ?? chatDialogMessage);
                    }
                  }}
                  variant="standard"
                  size="small"
                  sx={{'& .MuiInputBase-root': { bgcolor: 'transparent', '&:before, &:after': { display: 'none'}}}} 
                />

                <Grid sx={{ display: 'flex', gap: 0.5, alignItems: 'center', position: 'relative' }}>
                  <Tooltip title={'Прикрепить файл'} placement="top">
                    <IconButton 
                      sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25, '&:hover svg': { fill: theme.palette.primary.main } }}
                    >
                      <AttachFile onClick={(e) => {e.preventDefault();setShowModalUploadFile(true);}} sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                    </IconButton>
                  </Tooltip>

                    <Tooltip title="Выбрать эмодзи" placement="top">
                    <IconButton 
                      onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(prev => !prev) }}
                      sx={{
                        border: 'none', 
                        borderRadius: 1, 
                        transition: 'all 0.3s ease-in-out', 
                        height: 32, 
                        width: 32, 
                        p: 0.25, 
                        bgcolor: showEmojiPicker ? theme.palette.grey[100] : 'transparent',
                        '&:hover svg': { fill: theme.palette.primary.main }
                      }}
                    >
                      <EmojiEmotionsOutlined sx={{ fill: showEmojiPicker ? theme.palette.primary.main : theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={chatDialogMessage ? 'Отправить' : ''} placement="top">
                    <IconButton 
                      disabled={!chatDialogMessage}
                      onClick={actionSendMessage}
                      sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 32, width: 32, p: 0.25 }}
                    >
                      <Send sx={{ fill: !chatDialogMessage ? theme.palette.grey[400] : theme.palette.primary.main, fontSize: 18, m: 0.5 }} />
                    </IconButton>
                  </Tooltip>

                  {chatDialog?.chat_type == 2 && (
                    <MentionUserListMenu 
                      open={mentionOpen}
                      anchorEl={mentionAnchorEl}
                      onClose={() => setMentionAnchorEl(null)}
                      onSelect={insertMention}
                    />
                  )}

                
                  {/* Эмоджи пикер */}
                  <ClickAwayListener onClickAway={() => setShowEmojiPicker(false)}>
                    <div>
                      <Slide direction="left" in={showEmojiPicker} timeout={200} mountOnEnter unmountOnExit>
                        <Box
                          ref={emojiPickerRef}
                          sx={{
                            position: 'absolute',
                            bottom: 45,
                            right: 0,
                            mb: 1.55,
                            zIndex: 1000,
                            borderRadius: 1,
                            '& aside.EmojiPickerReact': {
                              '--epr-emoji-size': '32px',
                              '--epr-category-navigation-button-size': '24px',
                              '--epr-text-color': theme.palette.grey[600],
                              '--epr-search-input-placeholder-color': theme.palette.grey[400],
                              '--epr-search-border-color': theme.palette.grey[200],
                            }
                          }}
                        > 
                            <EmojiPicker 
                              onEmojiClick={(emojiData) => {
                                if(emojiData.isCustom) {
                                  actionSendMessage(null, emojiData.emoji);
                                  setChatDialogMessage('');
                                  setShowEmojiPicker(false)
                                  return;
                                }
                                setChatDialogMessage((prev) => prev + emojiData.emoji);
                              }}
                              customEmojis={customEmojisData.customEmojis}
                              emojiData={ru}
                              previewConfig={{ showPreview: false }}
                              skinTonesDisabled
                              autoFocusSearch={false}
                              lazyLoadEmojis={true}
                              theme="light"
                              searchPlaceholder="Поиск эмодзи..."
                              emojiStyle="native"
                            />
                        </Box>
                      </Slide>
                    </div>
                  </ClickAwayListener>
                  
                </Grid>

                <Fade in={showScrollDownButton && !showEmojiPicker} timeout={300}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 90,
                      right: 31,
                      zIndex: 10,
                      animation: showScrollDownButton ? 'bounce 0.5s ease-in-out' : 'none',
                      '@keyframes bounce': {
                        '0%': { transform: 'translateY(15px)', opacity: 0 },
                        '50%': { transform: 'translateY(-5px)', opacity: 1 },
                        '100%': { transform: 'translateY(0)', opacity: 1 },
                      }
                    }}
                  >
                    <Tooltip title={'Прокрутить вниз'} placement="top">
                      <IconButton 
                        onClick={() => scrollToBottom()} 
                        sx={{ 
                          borderColor: theme.palette.grey[100],
                          borderRadius: 1.5,
                          transition: 'all 0.3s ease-in-out', 
                          height: 42, 
                          width: 42, 
                          p: 0.25,
                          bgcolor: 'white',
                          boxShadow: 1,
                          '&:hover': {
                            borderColor: theme.palette.grey[100],
                            bgcolor: 'white',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <ArrowDownwardRounded sx={{ fill: lighten(theme.palette.primary.main, 0.3), fontSize: 22 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Fade>
              </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Card>
    </Box>

    <ChatDialog fullscreen={true} show={showModalChatDialogEdit} chat_id={chat_id} callBack={actionOnChatDialogCallback}/>
    <ModalInputFile title={"Загрузить файл"} show={showModalUploadFile} callBack= {actionUploadFileCallBack} />
    <ModalOneInputText title={"Новый групповой чат"} show={showModalCreateGroupDialogChat} callBack={actionNewChatCallBack} />
    <ModalAutoComplete 
      title={"Новый чат с пользователем"} 
      placeholder="Начните вводить для поиска"
      show={showModalCreatePersonalDialogChat} 
      callBack={actionNewChatCallBack} 
      fetcher={fetchUsers}
      data={User.userList}
    />
    <ModalAutoComplete 
        title={"Добавить пользователя в чат"} 
        placeholder="Начните вводить для поиска"
        show={showModalAddUserDialogChat} 
        callBack={actionNewUserAdd} 
        fetcher={fetchUsers}
        data={User.userList}
    />
    </>
  )
}
export default BetterChat;