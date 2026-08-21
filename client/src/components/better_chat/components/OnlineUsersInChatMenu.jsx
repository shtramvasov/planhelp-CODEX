import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Popover, useTheme, List, ListItem, Grid, Badge, Avatar, Typography, Chip, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails, lighten } from "@mui/material";
import { getUsername, getUserGradient, getShortChatName } from "../chat.utils";
import { ExpandMoreRounded, PersonRemove } from "@mui/icons-material";
import { actionDelUser } from "../actions";


export function OnlineUsersInChatMenu({ open, anchorEl, onClose }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const User = useSelector(state => state.user);
  const Chat = useSelector(state => state.chat);

  const { chat_id } = useParams();

  const onlineUsers = Chat.chatDialog?.chat_user_list?.filter(user => Chat.onLineClients?.[user.user_id] === true) || [];
  const offlineUsers  = Chat.chatDialog?.chat_user_list?.filter(user => Chat.onLineClients?.[user.user_id] !== true) || [];


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
          maxHeight: 550,
          scrollbarWidth: "thin",
          transition: 'scrollbar-color 0.3s',
          '&:not(:hover)': { scrollbarColor: 'transparent transparent' },
          scrollbarColor: `${theme.palette.grey[200]} transparent`,
          background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.9)} 0%, white 25%)`,
          borderRadius: 1,
          mt: 1,
          boxShadow: theme.shadows[1]
        }
      }}
    >              
      <List dense sx={{ p: 1, gap: 0.3 }}>
        {onlineUsers.map((user, index) => (
          <ListItem 
            key={user.user_id}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              justifyContent: 'space-between',
              gap: 3,
              borderRadius: 1,
              '&:hover': { bgcolor: theme.palette.grey[100] },
              '& .delete-button': { 
                opacity: 0, 
                visibility: 'hidden',
                transition: 'all 0.2s ease-in-out'
              },
              '&:hover .delete-button': { 
                opacity: 1, 
                visibility: 'visible'
              }
            }}
          >
            <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
              <Badge 
                color={'success'} 
                variant="dot" 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ '& .MuiBadge-badge': { width: 12, height: 12, borderRadius: '50%', border: '2px solid white' }}}
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

              <Typography  variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getUsername(user.username, user.login)}
              </Typography>
            </Grid>
            <Chip 
              size="small" 
              label='владелец' 
              color="default"
              sx={{ 
                visibility: user.user_role === 'OWNER' ? 'visible' : 'hidden',
                opacity: user.user_role === 'OWNER' ? 1 : 0,
              }}
            />

            {(onlineUsers?.find(p => p.user_id === User?.profile?.user_id)?.user_role === "OWNER" && user.user_role !== 'OWNER') && (
                <div className="delete-button">
                  <Tooltip title={'Удалить из чата'} placement="right-end">
                    <IconButton 
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(actionDelUser(chat_id, user.user_id));
                      }}
                      sx={{ border: 'none', backgroundColor: theme.palette.grey[200], '&:hover': { backgroundColor: theme.palette.grey[300] }, borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 28, width: 28, p: 0.25 }}
                    >
                      <PersonRemove sx={{ fill: theme.palette.error.light, fontSize: 18, m: 0.5 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
          </ListItem>
        ))}

        {offlineUsers?.length > 0 && (
          <Accordion
            elevation={0} 
            disableGutters 
            sx={{ 
              p: 0,
              m: 0,
              border: 'none',
              bgcolor: 'transparent',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRounded />}
              sx={{ 
                my: 0.5,
                minHeight: 36,
                px: 1,
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                  p: 0,
                }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: 12, 
                  color: theme.palette.grey[600],
                  fontWeight: 500
                }}
              >
                {offlineUsers.length} Не в сети
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0, width: '100%' }}>
              <List dense sx={{ gap: 0.3, p: 0, width: '100%' }}>
                {offlineUsers.map((user, index) => (
                  <ListItem 
                    key={user.user_id}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      justifyContent: 'space-between',
                      gap: 3,
                      borderRadius: 1,
                      '&:hover': { bgcolor: theme.palette.grey[100] },
                      '& .delete-button': { 
                        opacity: 0, 
                        visibility: 'hidden',
                        transition: 'all 0.2s ease-in-out'
                      },
                      '&:hover .delete-button': { 
                        opacity: 1, 
                        visibility: 'visible'
                      }
                    }}
                  >
                    <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
                      <Badge 
                        variant="dot" 
                        overlap="circular" 
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        sx={{ '& .MuiBadge-badge': { width: 12, height: 12, borderRadius: '50%', border: '2px solid white', bgcolor: theme.palette.grey[400] }}}
                      >
                        <Avatar 
                          src={user?.avatar_url} 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            fontSize: 10,
                            fontWeight: 500,
                            background: getUserGradient(theme, user?.user_id),
                            '& img': { objectFit: 'cover', objectPosition: 'center'} 
                          }}
                        >
                          {getShortChatName(user.username || user.login)}
                        </Avatar>
                      </Badge>

                      <Typography  variant="body2" sx={{ fontWeight: 700, fontSize: 13, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.username || user.login}
                      </Typography>
                    </Grid>
                    <Chip 
                      size="small" 
                      label='владелец' 
                      color="default"
                      sx={{ 
                        visibility: user.user_role === 'OWNER' ? 'visible' : 'hidden',
                        opacity: user.user_role === 'OWNER' ? 1 : 0,
                      }}
                    />

                    {(onlineUsers?.find(p => p.user_id === User?.profile?.user_id)?.user_role === "OWNER" && user.user_role !== 'OWNER') && (
                      <div className="delete-button">
                        <Tooltip title={'Удалить из чата'} placement="right-end">
                          <IconButton 
                            onClick={(e) => {
                              e.preventDefault();
                              dispatch(actionDelUser(chat_id, user.user_id));
                            }}
                            sx={{ border: 'none', backgroundColor: theme.palette.grey[200], '&:hover': { backgroundColor: theme.palette.grey[300] }, borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 28, width: 28, p: 0.25 }}
                          >
                            <PersonRemove sx={{ fill: theme.palette.error.light, fontSize: 18, m: 0.5 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}


      </List>
      
      {onlineUsers.length === 0 && (
        <Typography variant="body2" sx={{ color: theme.palette.grey[500], textAlign: 'center', py: 2 }}>
          Нет пользователей онлайн
        </Typography>
      )}
      
    </Popover>
  )
}
