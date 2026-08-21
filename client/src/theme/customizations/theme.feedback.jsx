import { alpha } from '@mui/material/styles';
import { gray, orange, red, green, brand } from './theme.privitives';

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme, ownerState }) => {
        
        // Определяем базовый цвет на основе severity
        const baseColor =
          ownerState.severity === 'error'
            ? red
            : ownerState.severity === 'success'
            ? green
            : ownerState.severity === 'warning'
            ? orange
            : brand; 
    
        return {
          borderRadius: 10,
          backgroundColor: baseColor[100],
          color: (theme.vars || theme).palette.text.primary,
          border: `1px solid ${alpha(baseColor[300], 0.5)}`,
          '& .MuiAlert-icon': {
            color: baseColor[500],
          },
        };
      },
    }
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};