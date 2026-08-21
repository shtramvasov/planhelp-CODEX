import { Popover, List, ListItem, useTheme, Grid, Typography, Divider, lighten } from "@mui/material";
import { ReplyRounded, EditRounded, DeleteRounded, ContentCopyRounded } from "@mui/icons-material";


export function MessageContextMenu({ open, anchorEl, chat_id, isMessageContext, onClose, onReply, onEdit, onCopy, onDelete }) {
  const theme = useTheme();

  const handleReply = () => {
    onClose();
    onReply();
  };

  const handleEdit = () => {
    onClose();
    onEdit(isMessageContext);
  };

  const handleCopy = () => {
    onClose();
    onCopy(isMessageContext.message_text);
  };

  const handleDelete = () => {
    onClose();
    onDelete(chat_id, isMessageContext.message_id)
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          scrollbarWidth: "thin",
          transition: 'scrollbar-color 0.3s',
          '&:not(:hover)': {
            scrollbarColor: 'transparent transparent',
          },
          scrollbarColor: `${theme.palette.grey[200]} transparent`,
          background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.9)} 0%, white 25%)`,
          borderRadius: 1,
          boxShadow: theme.shadows[1]
        }
      }}
    >    
      <List dense sx={{ p: 0.5, gap: 0.3 }}>

        <ListItem 
          onClick={handleReply}
          sx={{ 
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            justifyContent: 'space-between',
            p: 1,
            px: 2,
            borderRadius: 1,
            '&:hover': { bgcolor: theme.palette.grey[100] }
          }}
        >
          <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
            <ReplyRounded sx={{ fill: theme.palette.grey[600], fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.grey[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Ответить
            </Typography>
          </Grid>
        </ListItem>

        {isMessageContext.isMyMessage && (
          <ListItem 
            onClick={handleEdit}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              justifyContent: 'space-between',
              p: 1,
              px: 2,
              borderRadius: 1,
              '&:hover': { bgcolor: theme.palette.grey[100] }
            }}
          >
            <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
              <EditRounded sx={{ fill: theme.palette.grey[600], fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.grey[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Изменить
              </Typography>
            </Grid>
          </ListItem>
        )}

        <ListItem 
          onClick={handleCopy}
          sx={{ 
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            justifyContent: 'space-between',
            p: 1,
            px: 2,
            borderRadius: 1,
            '&:hover': { bgcolor: theme.palette.grey[100] }
          }}
        >
          <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
            <ContentCopyRounded sx={{ fill: theme.palette.grey[600], fontSize: 18 }} />
            <Typography  variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.grey[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Копировать текст
            </Typography>
          </Grid>
        </ListItem>

        {isMessageContext.isMyMessage && (
          <>
          <Divider flexItem sx={{ bgcolor: theme.palette.grey[400] }} />
          <ListItem 
            onClick={handleDelete}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out',
              justifyContent: 'space-between',
              p: 1,
              px: 2,
              borderRadius: 1,
              '&:hover': { bgcolor: theme.palette.grey[100] }
            }}
          >
            <Grid sx={{ display: 'flex', gap: 1.3, alignItems: 'center' }}>
              <DeleteRounded sx={{ fill: theme.palette.error.light, fontSize: 18 }} />
              <Typography  variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.error.light, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Удалить
              </Typography>
            </Grid>
          </ListItem>
          </>
        )}

      </List>                      
  </Popover>
  )
}