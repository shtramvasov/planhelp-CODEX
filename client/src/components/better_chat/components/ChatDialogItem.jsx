import { useSelector } from "react-redux";
import { Grid, Badge, Typography, useTheme, Avatar } from "@mui/material"
import { NotificationsOffRounded, Group } from "@mui/icons-material";
import { formatLastMessageDate, getShortChatName, getUserGradient } from "../chat.utils";
import { ChatLastMessagePreview } from "./ChatLastMessagePreview";
import { TypingUsers } from "./TypingUsers";



export function ChatDialogItem({ chat_id, chatDialog, onChatDialogClick }) {
  const theme = useTheme();

  const Chat = useSelector((state) => state.chat);

  return (
    <Grid
      key={chatDialog.chat_id}
      onClick={(e) => onChatDialogClick(e, chatDialog.chat_id, chatDialog.chat_type)}
      sx={{ position: 'relative',display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s ease-in-out', p: 1, borderRadius: 1,
        bgcolor: Number(chat_id) === Number(chatDialog.chat_id) ? theme.palette.grey[100] : 'transparent',
        '&:hover': {
          bgcolor: Number(chat_id) === Number(chatDialog.chat_id) ? theme.palette.grey[200] : theme.palette.grey[100],
          cursor: 'pointer',
        }
      }}
    >
      <Grid spacing={1.25} container sx={{ flexWrap: 'nowrap' }}>
        <Grid item sx={{ flexShrink: 0 }}>
          <Badge 
            color={'success'} 
            invisible={chatDialog.chat_type === 2 || !Chat.onLineClients[chatDialog.with_user_id]} 
            variant="dot" 
            overlap="circular" 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ '& .MuiBadge-badge': { transition: 'all 0.3s ease-in-out', width: 14, height: 14, borderRadius: '50%', border: `2px solid ${Number(chat_id) == Number(chatDialog.chat_id) ? theme.palette.grey[100] : 'white'}` }}}
          >
            <Avatar 
              src={chatDialog.avatar_url} 
              sx={{  width: 46, height: 46, fontSize: 17, fontWeight: 500,
                background: chatDialog.chat_type == 1 ? getUserGradient(theme, chatDialog.with_user_id ?? chatDialog.user_id) : 'transtarent',
                '& img': { objectFit: 'cover', objectPosition: 'center'} 
              }}
            >
              {getShortChatName(chatDialog.chat_name)}
            </Avatar>
          </Badge> 
        </Grid>  

        <Grid item sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ width: '100%', display: 'block', fontWeight: 600, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {chatDialog.notify_status == 0 && <NotificationsOffRounded sx={{ fill: theme.palette.grey[500], fontSize: 18, m: 0.35 }} /> }
            {chatDialog.chat_type == 2 && <Group sx={{ fill: theme.palette.grey[500], fontSize: 18, m: 0.35 }} /> }
            {chatDialog.chat_name}
          </Typography>

          <Typography variant="body2" sx={{ fontSize: 12, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

            {Object.keys(Chat.chatDialogStates?.[chatDialog?.chat_id]?.chatTyping || {}).length > 0 ? (
              <TypingUsers typingData={chatDialog?.chat_id && Chat.chatDialogStates[chatDialog.chat_id]?.chatTyping} chatType={chatDialog.chat_type} />
            ) : (
              <ChatLastMessagePreview message={chatDialog.last_message} />
            )}             
          </Typography>
        </Grid>  

        <Grid item sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 400, fontSize: 10, color: theme.palette.grey[400] }}>
            {chatDialog.last_message_at && formatLastMessageDate(chatDialog.last_message_at) }
          </Typography>
          
          <Badge 
            badgeContent={chatDialog.chat_id == chat_id ? 0 : chatDialog.last_message_count}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              '& .MuiBadge-badge': { position: 'absolute', top: 8, right: 6, fontSize: 10, height: 16, minWidth: 16, borderRadius: '8px', padding: '0 2px', color: 'white',
                bgcolor: chatDialog.notify_status == 1 ? theme.palette.error.light : theme.palette.grey[400],
              }
            }}
          />
        </Grid> 
      </Grid>
    </Grid>
  )
}