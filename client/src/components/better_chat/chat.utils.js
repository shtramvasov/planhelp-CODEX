import moment from 'moment-timezone';
import { capitalizeFirstLetter } from '../helpers/capitalizeFirstLetter'


export const getShortChatName = (raw) => {
  const arr = raw.split(" ");
  const one = arr[0].substr(0,1).toUpperCase();
  const two = arr[1]?.substr(0,1).toUpperCase();
  return one + (two ?? "");
}


export const getColorChatGradient = (chat_id) => {
  const colors = {
      0 : "linear-gradient(135deg, rgb(237, 244, 248) 0%, rgb(161, 198, 219) 100%)" ,
      1 : "linear-gradient(135deg, rgb(237, 244, 248) 0%, rgb(161, 198, 219) 100%)" ,   
      2 : "linear-gradient(135deg, rgb(248, 240, 237) 0%, rgb(219, 199, 161) 100%)" ,
      3 : "linear-gradient(135deg, rgb(237, 248, 240) 0%, rgb(146, 219, 162) 100%)" ,
      4 : "linear-gradient(135deg, rgb(248, 237, 241) 0%, rgb(219, 146, 185) 100%)" ,
      5 : "linear-gradient(135deg, rgb(225, 222, 246) 0%, rgb(127, 125, 238) 100%)" 
  }
  const index = Number(chat_id) % 6;
  return colors[index];
}


export const shouldShowMetadata = (messages, currentIndex) => {
  const currentMessage = messages[currentIndex];
  const prevMessage = messages[currentIndex - 1];

  if (!prevMessage) return true;

  const isEdited = currentMessage.status == 1;
  const isPrevEdited = prevMessage.status == 1;
  
  const timeDiff = new Date(currentMessage.created_at) - new Date(prevMessage.created_at);
  const isDifferentUser = !prevMessage || prevMessage.user_id !== currentMessage.user_id;
  const isTimeGap = timeDiff > 5 * 60 * 1000;
  
  return isDifferentUser || isTimeGap || isEdited || isPrevEdited;
};


export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};


export const formatLastMessageDate = (dateString) => {
  if (!dateString) return null;

  const date = moment(dateString);
  const now = moment();

  const diffDays = now.diff(date, 'days');

  // Вчера
  if (diffDays === 1) return 'вчера';

  // 2-6 дней назад - день недели
  if (diffDays >= 2 && diffDays <= 6) {
    return date.format('dd');
  }

  // Больше недели
  if (diffDays > 6) {
    return date.format('DD.MM.YYYY');
  }
      
  return date.fromNow(true);
};


export const getUserGradient = (theme, userId) => {
  if (!userId) return `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`;
  
  const gradients = [
    [theme.palette.primary.light, theme.palette.primary.main],
    [theme.palette.secondary.light, theme.palette.secondary.main],
    [theme.palette.success.light, theme.palette.success.main],
    [theme.palette.info.light, theme.palette.info.main],
    [theme.palette.warning.light, theme.palette.warning.main],
    [theme.palette.info.light, theme.palette.info.main],
  ];
  
  const index = Math.abs(Number(userId)) % gradients.length;
  const [color1, color2] = gradients[index];
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};



export const shouldShowDateDivider = (messages, currentIndex) => {
  const currentMessage = messages[currentIndex];
  const prevMessage = messages[currentIndex - 1];

  if (!prevMessage) return true;

  const currentDate = moment(currentMessage.created_at).format('YYYY-MM-DD');
  const prevDate = moment(prevMessage.created_at).format('YYYY-MM-DD');

  return currentDate !== prevDate;
};


export const formatDateDivider = (dateString) => {
  const date = moment(dateString);
  const now = moment();

  const diffDays = now.startOf('day').diff(date.startOf('day'), 'days');

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';

  if (diffDays >= 2 && diffDays <= 6) {
    return capitalizeFirstLetter(date.format('dddd'));
  }

  return date.format('D MMMM YYYY');
};


export const getUsername = (username, login) => {
  return username || login;
};


export const getMessagePreview = (message) => {
  if (!message) return null;
  
  const cleanMessage = message.split('?')[0].split('#')[0];
  const ext = cleanMessage?.split('.').pop()?.toLowerCase();
  
  const types = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    video: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
    file: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip', 'rar']
  };
  
  if (types.image.includes(ext)) return { type: 'image', url: message };
  if (types.video.includes(ext)) return { type: 'video', name: message.split('/').pop() };
  if (types.audio.includes(ext)) return { type: 'audio', name: message.split('/').pop() };
  if (types.file.includes(ext)) return { type: 'file', name: message.split('/').pop() };
  return { type: 'text', text: message };
};



export const getMessageMetaData = ({ messages, index, message, currentUserId, chatDialog }) => {
  const nextMessage = messages[index + 1];
  const showDateDivider = shouldShowDateDivider(messages, index);
  const showMetadata = shouldShowMetadata(messages, index);
  const isMyMessage = message.user_id === currentUserId;
  const isEdited = message.status === 1;
  const isNextEdited = nextMessage?.status === 1;
  const isReply = Boolean(message.reply_message_id);
  const isDiscussionChat =chatDialog?.discussion_allow === 1;
  const timeDiffNext = nextMessage ? new Date(nextMessage.created_at) - new Date(message.created_at) : 0;
  const isLastInGroup = !nextMessage || nextMessage.user_id !== message.user_id || timeDiffNext > 5 * 60 * 1000 || isNextEdited || isReply;

  return {
    showDateDivider,
    showMetadata,
    isMyMessage,
    nextMessage,
    isEdited,
    isNextEdited,
    isReply,
    isDiscussionChat,
    isLastInGroup,
  };
};