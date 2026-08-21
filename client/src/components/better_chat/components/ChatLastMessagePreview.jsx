import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Videocam, Audiotrack, NoteRounded } from '@mui/icons-material';


export function ChatLastMessagePreview({ message }) {
  const theme = useTheme();


  const preview = useMemo(() => {
    if (!message) return null;

    const clean = message.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop()?.toLowerCase();

    const isImage = ['jpg','jpeg','png','gif','webp','bmp'].includes(ext);
    const isVideo = ['mp4','webm','mov','avi','mkv'].includes(ext);
    const isAudio = ['mp3','wav','flac','aac','ogg','m4a'].includes(ext);
    const isFile  = ['pdf','doc','docx','xls','xlsx','txt','zip','rar'].includes(ext);

    return { clean, isImage, isVideo, isAudio, isFile };
  }, [message]);

  if (!preview) return null;

  const { isImage, isVideo, isAudio, isFile } = preview;

  if (isImage) {
    return (
      <Box sx={{ display: 'flex', gap: 1, color: theme.palette.primary.main }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Фотография:
        </Typography>

        <Box
          component="img"
          src={message}
          sx={{ width: 20, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
        />
      </Box>
    );
  }

  if (isVideo) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, color: theme.palette.primary.main }}>
        <Videocam sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <b>Видео:</b> {message.split('/').pop()}
        </Typography>
      </Box>
    );
  }

  if (isAudio) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, color: theme.palette.primary.main }}>
        <Audiotrack sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <b>Аудио:</b> {message.split('/').pop()}
        </Typography>
      </Box>
    );
  }

  if (isFile) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, color: theme.palette.primary.main }}>
        <NoteRounded sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <b>Файл:</b> {message.split('/').pop()}
        </Typography>
      </Box>
    );
  }

  return (
    <Typography sx={{ fontSize: 12, color: theme.palette.grey[700], overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {message}
    </Typography>
  );
}


