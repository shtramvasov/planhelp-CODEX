import { useSelector } from "react-redux";
import { Popover, useTheme, List, ListItem, Grid, Badge, Avatar, Typography, lighten } from "@mui/material";
import { getShortChatName, getUserGradient, getUsername } from "../chat.utils";

export function MentionUserListMenu({ open, anchorEl, onClose, onSelect }) {
  const theme = useTheme();
  
  const Chat = useSelector(state => state.chat);

  const userList = Chat.chatDialog?.chat_user_list?.map(user => ({
    ...user,
    isOnline: Chat.onLineClients?.[user.user_id] === true
  })) || [];


  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 550,
          maxHeight: 350,
          scrollbarWidth: "thin",
          transition: 'scrollbar-color 0.3s',
          '&:not(:hover)': { scrollbarColor: 'transparent transparent' },
          scrollbarColor: `${theme.palette.grey[200]} transparent`,
          background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.9)} 0%, white 25%)`,
          borderRadius: 1,
          mt: -7,
          boxShadow: theme.shadows[1]
        }
      }}
    >
      <List dense sx={{ p: 1, gap: 0.3 }}>
        {userList.map((user, index) => (
          <ListItem 
            key={user.user_id}
            onClick={() => onSelect(user)}
            sx={{ 
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              justifyContent: 'space-between',
              gap: 3,
              borderRadius: 1,
              '&:hover': { bgcolor: theme.palette.grey[100] },
            }}
          >
            <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
              <Badge 
                variant="dot" 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ 
                  '& .MuiBadge-badge': { 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    border: '2px solid white',
                    bgcolor: user.isOnline ? theme.palette.success.main : theme.palette.grey[400]
                  }
                }}
              >
                <Avatar 
                  src={user?.avatar_url} 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    fontSize: 10,
                    fontWeight: 500,
                    background: getUserGradient(theme, user?.user_id),
                    '& img': { objectFit: 'cover', objectPosition: 'center'},
                  }}
                >
                  {getShortChatName(getUsername(user.username, user.login))}
                </Avatar>
              </Badge>

              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getUsername(user.username, user.login)}
              </Typography>
            </Grid>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 11, color: theme.palette.grey[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{user.login}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Popover>
  )
}
