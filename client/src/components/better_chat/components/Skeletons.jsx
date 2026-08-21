import { Grid, Skeleton, Typography, useTheme } from "@mui/material"
import { ReactComponent as ChatNotFoundImg } from '../../../resources/img/chat-not-found.svg';


export function ChatHeaderSkeleton() {
  return (
    <Grid sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Grid sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={50} height={50} />
        <Grid item sx={{ flex: 1, minWidth: 0, pl: 1.5 }}>
          <Skeleton variant="text" sx={{ fontSize: 14, width: 150 }} />
          <Skeleton variant="text" sx={{ fontSize: 8, width: 120 }} />
        </Grid>
      </Grid>
      <Skeleton variant="rounded" width={20} height={20} sx={{ mr: 1.2 }} />
  </Grid>
  )
}


export function ChatNotFoundSkeleton({ searchChatList }) {
  const theme = useTheme();

  return (
    <Grid 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Grid>
        <ChatNotFoundImg />
        <Typography variant="body2" sx={{ mt: -1.2, fontSize: 14, color: theme.palette.grey[600], fontWeight: 600 }}>
          Ничего не найдено
        </Typography>
      </Grid>
      <Typography variant="caption" component="div" sx={{ mt: 0.5, display: 'block', color: theme.palette.grey[400] }}>
        По запросу <span style={{ color: theme.palette.grey[600], fontWeight: 600 }} >{searchChatList}</span>
      </Typography>
    </Grid>
  )
}