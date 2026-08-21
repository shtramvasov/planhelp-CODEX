
import { deleteChatDialogUser, getChatDialog, postChatDialog } from "../../../network/ChatNetwork";
import { uploadFile } from "../../../network/DiskNetwork";
import { wsSocket } from "../../../network/WebSocket";
import { addNegativeMessage, addPositiveMessage } from "../../../reducers/App";
import { addChatDialog, setIsLoading } from "../../../reducers/Chat";
import { messages } from "../../constants/Msg";


export const fetchChatDialog = (chat_id) => {
   return (dispatch) => {
     getChatDialog({chat_id},(err,resp) => {
         if (!err) {
             dispatch(addChatDialog(resp));
         } else {
             dispatch(addNegativeMessage(err));
         }
     });
   }
};


export const actionDelUser = (chat_id, user_id) => {
  return (dispatch) => {
    deleteChatDialogUser(
      { chat_id, user_id },
      (err) => {
        if (!err) {
          dispatch(addPositiveMessage(messages.SUCCESS));

          dispatch(fetchChatDialog(chat_id));
        } else {
          dispatch(addNegativeMessage(err));
        }
      }
    );
  };
};


export const actionSendChatTyping = (chat_id, pauseRef) => {
    if (!wsSocket?.socket) return;

    if (!pauseRef.current) {
      wsSocket.socket.send(JSON.stringify({
        action: "chat_typing",
        payload: { chat_id }
      }));

      pauseRef.current = true;

      setTimeout(() => {
        pauseRef.current = false;
      }, 4000);
    }
};


export const actionLeaveChat = (user_id, chat_id) => {
  return (dispatch) => {
    deleteChatDialogUser(
      { user_id, chat_id },
      (err) => {
        if (!err) {
          dispatch(addPositiveMessage(messages.SUCCESS));

          actionGetChatDialogList()
        } else {
          dispatch(addNegativeMessage(err));
        }
      }
    );
  };
};


export const fetchUploadFile = (file, chat_id, callbacks = {}) => {
  return (dispatch) => {
    uploadFile({ file }, (err, response) => {
      if (!file) {
        return;
      }

      if (callbacks.beforeUpload) callbacks.beforeUpload();

      if (!err && response?.url) {
        dispatch(addPositiveMessage(messages.SUCCESS));
        
        wsSocket.socket.send(JSON.stringify({
            action: "chat_message",
            payload: {
                chat_id,
                message_text: response.url
            }
        }));
        
        if (callbacks.afterUpload) callbacks.afterUpload();
          
      } else {
          dispatch(addNegativeMessage(messages.UPLOAD_FAIL));
      }
  });
  }
}

export const handleDeleteChatMessage = (chat_id, message_id) => {
    wsSocket.socket.send(JSON.stringify({
        action_id : crypto.randomUUID(),
        action : "chat_message_delete",
        payload : {
            chat_id,
            message_id
        }
    }));
}

export const actionNewChatDialogName = (chat_id, chat_name) => {
  return (dispatch) => {
    if (!chat_name) return;
    
    postChatDialog({ chat_id, chat_name}, 
        (err,resp) => {
            if (!err) {
                  dispatch(addPositiveMessage(messages.SUCCESS));
                  dispatch(fetchChatDialog(chat_id));
                  actionGetChatDialogList();
            } else {
                dispatch(addNegativeMessage(err));
            }
        }
    );
  }
}


export const actionChangeNotifySwitch = (chat_id,notify_status) => {
  return (dispatch) => {
    postChatDialog(
        { chat_id, notify_status }, 
        (err,resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                dispatch(fetchChatDialog(chat_id));

                actionGetChatDialogList();
            } else {
                dispatch(addNegativeMessage(err));
            }
        }
    );
   }
}


export const actionChangeDiscussionSwitch = (chat_id, discussion_allow) => {
  return (dispatch) => { 
    postChatDialog(
        { chat_id, discussion_allow: discussion_allow }, 
        (err,resp) => {
            if (!err) {
                dispatch(addPositiveMessage(messages.SUCCESS));
                dispatch(fetchChatDialog(chat_id));
                actionGetChatDialogList();
            } else {
                dispatch(addNegativeMessage(err));
            }
        }
    );
  }
}


export const actionGetChatDialogMessageList = ({ chat_id }) => {
  return (dispatch, getState) => {
    const state = getState();

    const isAllMessagesLoaded = state.chat.chatDialogStates[chat_id]?.isAllMessagesLoaded;
    const chatDialogMessageList = state.chat.chatDialogMessageList[chat_id] || [];
    const offset_chat_message = chatDialogMessageList[0];

    if (isAllMessagesLoaded) {
       dispatch(setIsLoading({ chat_id: chat_id, isLoading: false }));
       return;
     }     
     
     wsSocket.socket.send(JSON.stringify({
         action_id : crypto.randomUUID(),
         action : "chat_message_list",
         payload : { chat_id, offset_message_id : offset_chat_message?.message_id}
     }));
  }
}


export const actionSetChatDialogReadAll = (chat_id) => {
  wsSocket.socket.send(JSON.stringify({
      action : "chat_read_all",
      action_id : crypto.randomUUID(),
      payload : {
          chat_id
      }
  }));
}


export const actionGetChatDialogList = () => {
  wsSocket.socket.send(JSON.stringify({
      action : "chat_list",
      action_id : crypto.randomUUID(),
      payload : {}
  }));
}


export const copyTextToClipboard = async (message_text, savedRange) => {
    let textToCopy = message_text;
    
    if (savedRange) {
      const div = document.createElement('div');
      div.appendChild(savedRange.cloneContents());
      textToCopy = div.innerText || div.textContent || message_text;
    }
    
    await navigator.clipboard.writeText(textToCopy);   
    return true;
};
