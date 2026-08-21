import React, { useMemo } from 'react';
import { Grid, Typography, Box, useTheme } from '@mui/material';
import { getUsername } from '../chat.utils';


export function TypingUsers({ typingData, chatType }) {
  const theme = useTheme();


  const typingUsers = useMemo(() => {

    if (!typingData) return [];

    if (getUsername(typingData.username, typingData.login)) {
      return [getUsername(typingData.username, typingData.login)];
    }

    return Object.values(typingData)
      .filter((user) => user && (getUsername(user.username, user.login)))
      .map((user) => getUsername(user.username, user.login));
  }, [typingData]);

  if (!typingUsers.length) {
    return null;
  }


  const renderText = () => {

    if (chatType === 1) {
      return <>печатает</>;
    }

    if (typingUsers.length === 1) {
      return (<><b>{typingUsers[0]}</b> печатает</>);
    }

    if (typingUsers.length === 2) {
      return (
        <>
          <b>{typingUsers[0]}</b>
          {' и '}
          <b>{typingUsers[1]}</b>
          {' печатают'}
        </>
      );
    }

    if (typingUsers.length >= 3) {
      return (
        <>
          <b>{typingUsers[0]}</b>
          {', '}
          <b>{typingUsers[1]}</b>
          {' и '}
          {typingUsers.length - 2}
          {' печатают'}
        </>
      );
    }

    return null;
  };


  return (
    <Grid
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'flex-end'
      }}
    >

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: 12,
          color: theme.palette.primary.main,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {renderText()}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 0.3,
          mb: 0.3
        }}
      >

        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 3,
              height: 3,

              bgcolor:
                theme.palette.primary.main,

              borderRadius: '50%',

              animation:
                'typing 1s infinite',

              animationDelay: `${i * 0.2}s`,

              '@keyframes typing': {
                '0%, 60%, 100%': {
                  opacity: 0.3,
                  transform: 'translateY(0)'
                },

                '30%': {
                  opacity: 1,
                  transform: 'translateY(-2px)'
                }
              }
            }}
          />
        ))}

      </Box>

    </Grid>
  )
}