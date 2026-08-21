import React, { memo } from 'react';
import { Grid, Typography, useTheme, alpha, Badge, Avatar, Chip, lighten, darken } from '@mui/material';
import { useSelector } from 'react-redux';
import { formatDateDivider, formatMessageTime, getShortChatName, getUserGradient } from '../chat.utils';
import formatText from '../../helpers/FormatText';

export const ChatMessageItem = memo(({
  message,
  index,
  itemRefs,
  metadata,
  setHoveredMessageId,
  handleMouseUp,
  setMessageContext,
  setIsMessageContext,
  setIsReplyMode,
  handleNavigate,

  }) => {
  const theme = useTheme();

  const onLineClients = useSelector(state => state.chat.onLineClients);
  const { showDateDivider, showMetadata, isMyMessage, isEdited, isDiscussionChat, isLastInGroup } = metadata;

  return (
    <React.Fragment key={message.message_id}>
      {showDateDivider && (
        <Grid sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Typography
            sx={{
              px: 1.5,
              py: 0.5,
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 5,
              bgcolor: alpha(theme.palette.grey[500], 0.2),
              color: theme.palette.grey[700],
            }}
          >
            {formatDateDivider(message.created_at)}
          </Typography>
        </Grid>
      )}
      <Grid 
        ref={(el) => itemRefs.current[message.message_id] = el}
        sx={{ display: 'flex',flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', mb: isLastInGroup ? 1.2 : 0.5 }}
      >
        <Grid 
          onMouseEnter={() => setHoveredMessageId(message.message_id)}
          onMouseLeave={() => setHoveredMessageId(null)}
          onMouseUp={handleMouseUp}
          onContextMenu={(event) => { 
            event.preventDefault(); 
            event.stopPropagation(); 

            const targetElement = event.currentTarget
            setMessageContext(targetElement);
            setIsMessageContext({ 
              isMyMessage, 
              message_id: message.message_id, 
              message_text: message.message_text, 
              message_from: (message.username ?? message.login) 
            });

          }}
          onDoubleClick={() => {
            setIsMessageContext({ 
              isMyMessage, 
              message_id: message.message_id, 
              message_text: message.message_text, 
              message_from: (message.username ?? message.login) 
            })
            setIsReplyMode(true)
          }}
          sx={{ 
            display: 'flex',
            gap: 1,
            maxWidth: '70%',
            flexDirection: isMyMessage ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
          }}
        >
          {showMetadata && !isMyMessage && (
            <Grid sx={{ flexShrink: 0 }}>
              <Badge 
                color={'success'} 
                invisible={!onLineClients[message?.user_id]} 
                variant="dot" 
                overlap="circular" 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{ '& .MuiBadge-badge': { width: 14, height: 14, borderRadius: '50%', border: '2px solid white' }}}
              >
                <Avatar 
                  src={message.avatar_url} 
                  sx={{ 
                    width: 42, 
                    height: 42, 
                    fontSize: 16,
                    fontWeight: 500,
                    background: getUserGradient(theme, message.user_id),
                    '& img': { objectFit: 'cover', objectPosition: 'center'} 
                  }}
                >
                  {getShortChatName(message.username || message.login)}
                </Avatar>
              </Badge>
            </Grid>
          )}
          
          {!showMetadata && !isMyMessage && <Grid sx={{ width: 42, flexShrink: 0 }} />}                          

          <Grid sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
            {showMetadata && !isMyMessage && (
              <Grid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 0.75, mb: 0.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.palette.primary.dark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {message.username || message.login}
                </Typography>
                
                <Typography variant="caption" sx={{ fontSize: 10, color: theme.palette.grey[500], whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {isEdited && 'изменено ' }{formatMessageTime(message.created_at)}
                </Typography>
              </Grid>
            )}

            <Grid 
              sx={{ 
                display: 'inline-flex',
                position: 'relative',
                flexDirection: 'column',
                width: 'fit-content',
                p: 1.35,
                pb: isDiscussionChat ? 0.5 : 1.35,
                background: isMyMessage 
                  ? `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`
                  : `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                borderRadius: 1.5,
                borderTopLeftRadius: showMetadata && !isMyMessage ? 1 : 1.5,
                borderTopRightRadius: showMetadata && isMyMessage ? 1 : 1.5,
              }}
            >

              {message.reply_chat_message && (
                <Grid
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    background: lighten(theme.palette.primary.light, 0.75), 
                    borderRadius: 0.6,
                    p: 0.5,
                    mb: 0.75,
                    borderLeft: '5px solid',
                    borderColor: darken(theme.palette.primary.light, 0.1)
                  }}
                >
                  <Typography variant="body2" 
                    sx={{ 
                      fontSize: 13,
                      fontWeight: 600,
                      color: theme.palette.primary.dark,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {message?.reply_chat_message?.username ?? message?.reply_chat_message?.login}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap',wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
                    {formatText(message?.reply_chat_message?.message_text)}
                  </Typography>
                </Grid>
              )}

              <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {formatText(message.message_text)} 
              </Typography>

              {/* Комментарии для дискуссий */}
              {isDiscussionChat && (
                <Grid 
                  sx={{ 
                    display: 'inline-block', 
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 0.5,
                    mt: 1,
                    py: 0.7,
                    borderTop: `1px solid white`,
                  }}
                    >
                      <Grid 
                        onClick={() => handleNavigate(message.message_id, message.child_message_count)}
                        sx={{ width: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.5 }}
                      > 
                        <Chip 
                          size="small" 
                          label={message?.child_message_count || 0} 
                          color="default"
                          sx={{ borderRadius: 1, p: 0, cursor: 'pointer' }}
                        />
                        <Typography 
                            variant="body2" 
                            sx={{ 
                              color: theme.palette.primary.main, 
                              fontWeight: 500,
                              cursor: 'pointer',
                              fontSize: 13, 
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': { color: theme.palette.primary.dark }
                            }} 
                          >
                            комментариев
                          </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
          
            {(isLastInGroup || isEdited) && isMyMessage && (
              <Typography variant="caption" sx={{ mt: 0.3, mr: 1, fontSize: 10, color: theme.palette.grey[500], textAlign: 'right'}}>
                {isEdited && 'изменено ' }{formatMessageTime(message.created_at)}
              </Typography>
            )}
          </Grid>                        
          
          {showMetadata && isMyMessage && (
            <Avatar 
              src={message.avatar_url} 
              sx={{ 
                width: 42, 
                height: 42, 
                fontSize: 16,
                fontWeight: 500,
                background: getUserGradient(theme, message.user_id),
                '& img': { objectFit: 'cover', objectPosition: 'center'} 
              }}
            >
              {getShortChatName(message.username || message.login)}
            </Avatar>
          )}
          {!showMetadata && isMyMessage && <Grid sx={{ width: 42, flexShrink: 0 }} />}
        </Grid>  
      </Grid>
      </React.Fragment>
  )
})

