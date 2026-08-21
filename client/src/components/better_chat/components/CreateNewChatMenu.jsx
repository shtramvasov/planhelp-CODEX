import { Popover, List, ListItem, Grid, Typography, useTheme } from '@mui/material';
import { Person3Rounded, Group } from '@mui/icons-material';
import { lighten } from '@mui/material/styles';


export function CreateNewChatMenu({ open, anchorEl, onClose, createPersonalChat, createGroupChat }) {
  const theme = useTheme();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      PaperProps={{
        sx: {
          maxHeight: 550,
          scrollbarWidth: "thin",
          transition: 'scrollbar-color 0.3s',
          '&:not(:hover)': { scrollbarColor: 'transparent transparent' },
          scrollbarColor: `${theme.palette.grey[200]} transparent`,
          background: `linear-gradient(to top, ${lighten(theme.palette.grey[50], 0.9)} 0%, white 25%)`,
          borderRadius: 1,
          boxShadow: theme.shadows[1]
        }
      }}
    >    
      <List dense sx={{ p: 0.5, gap: 0.3 }}>
        <ListItem 
          onClick={(e) => {
            e.preventDefault();
            createPersonalChat();
          }}
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
            <Person3Rounded sx={{ fill: theme.palette.grey[600], fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.grey[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Личный чат
            </Typography>
          </Grid>
        </ListItem>

        <ListItem 
          onClick={(e) => {
            e.preventDefault();
            createGroupChat();
          }}
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
            <Group sx={{ fill: theme.palette.grey[600], fontSize: 18 }} />
            <Typography  variant="body2" sx={{ fontWeight: 500, fontSize: 14, color: theme.palette.grey[600], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Групповой чат
            </Typography>
          </Grid>
        </ListItem>
      </List>                      
    </Popover>
  )
}