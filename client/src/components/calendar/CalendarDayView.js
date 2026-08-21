
import { useSelector } from 'react-redux'
import { Grid, Typography, useTheme, Box, Skeleton, Tooltip } from "@mui/material";
import { AddCircleRounded } from "@mui/icons-material";
import { darken, alpha } from '@mui/material/styles';
import moment from 'moment-timezone';
import { getVariantColor } from "./calendar.utils";
import { capitalizeFirstLetter } from '../helpers/capitalizeFirstLetter';
moment.locale('ru');



function CalendarDayView({ dateArrays, isLoading, actionCallModalNote, onEditNote }) {
  const theme = useTheme();
  
  const Note = useSelector((state) => state.note);
  
  return (
    <>
    <Grid sx={{ display: 'flex', flexDirection: 'column', my: -2  }}>
      {isLoading ? (
        Array(15).fill(0).map((_, dayIndex) => (
          <Box
            key={dayIndex}
            sx={{
              borderBottom: '1px solid',
              borderColor: theme.palette.grey[100],
              p: 0.5,
            }}
          >
            <Skeleton variant="text" height={40} width="100%" /> 

          </Box>
        )
          
        )
      ) : (
        dateArrays?.map((week,i) => {
          return (             
            <Grid key={i} sx={{ display: 'flex', flexDirection: 'column' }}>
              {week.map((day, index) => {
                const globalIndex = i * 7 + index;
                const isToday = (new Date()).toDateString() === day.toDateString();
                const isWeekend = [5, 6].includes(day.getUTCDay());

                return (
                  <Grid sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 1.2,
                      gap: 1,
                      bgcolor: globalIndex % 2 === 0
                        ? 'transparent'
                        : theme.palette.grey[50],
                      borderBottom: `1px solid ${theme.palette.grey[100]}`
                    }}
                  >
                    <Grid sx={{ display: 'flex' }} >
                      <Grid sx={{ 
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Tooltip title='Добавить заметку' placement='top'>
                          <AddCircleRounded 
                            onClick={(e) => {e.stopPropagation(); actionCallModalNote(e,day)}}
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.3s ease-in-out',
                              fill: theme.palette.primary.light, 
                              "&:hover": {
                                fill: theme.palette.primary.main
                              },
                              fontSize: 18, 
                              m: 0
                            }}
                            />
                        </Tooltip>
                        
                        <Grid 
                          sx={{ 
                            display: 'flex', 
                            gap: 0.5, 
                            alignItems: 'center' 
                          }}
                        >
                          <Typography textAlign={'left'} variant='body2' fontSize={12} fontWeight={600} color={isWeekend ? theme.palette.grey[400] : isToday ? theme.palette.primary.main  : theme.palette.grey[700]} >
                            {capitalizeFirstLetter(moment(day).format('dddd')) + ','}
                          </Typography>

                          <Typography 
                            variant='body2' 
                            color={isWeekend ? theme.palette.grey[400] : isToday ? theme.palette.primary.main  : theme.palette.grey[700]}
                          >
                            {moment(day).format('D MMMM')}
                          </Typography>
                        </Grid>

                      </Grid>
                    </Grid>


                    {
                      Note.noteList[moment(day).format('YYYY-MM-DD')]?.length > 0 && (

                        <Box sx={{ position: 'relative', mt: 2, pl: 3 }}>
                          <Box sx={{
                            position: 'absolute',
                            top: -7,
                            left: 35,
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: `8px solid ${alpha(theme.palette.info.light, 0.3)}`,
                          }} />
                          
                          <Grid 
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: 1,
                              backgroundColor: alpha(theme.palette.info.light, 0.3),
                              borderRadius: 2,
                              p: 1.5,
                            }}
                          >
                            {Note.noteList[moment(day).format('YYYY-MM-DD')] && (
                            Note.noteList[moment(day).format('YYYY-MM-DD')].map((note, index) => {
                              return (
                                <Grid
                                  key={note.note_id}
                                  onClick={(e) => {e.stopPropagation(); onEditNote(e,note)}}
                                  sx={{ 
                                    display: 'flex', 
                                    textAlign: 'start',
                                    gap: 1,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    p: 1,
                                    borderRadius: 1,
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease-in-out',
                                    borderColor: 
                                      getVariantColor(note.variant, theme).color !== 'transparent' 
                                        ? darken(getVariantColor(note.variant, theme).color, 0.2)
                                        : 'rgba(0, 0, 0, 0)',

                                    bgcolor: getVariantColor(note.variant, theme).color !== 'transparent'
                                      ? alpha(getVariantColor(note.variant, theme).color, 0.5)
                                      : 'rgba(0, 0, 0, 0)',

                                    '&:hover': {
                                      bgcolor: getVariantColor(note.variant, theme).color !== 'transparent'
                                        ? alpha(getVariantColor(note.variant, theme).color, 0.7)
                                        : 'rgba(0, 0, 0, 0)',
                                    }
                                  }}
                                >
                                  <Typography variant='caption' fontWeight={700} color={theme.palette.grey[700]}>{moment(note.remind_on).format("HH:mm")}</Typography>
                                  <Typography
                                    variant='body2'
                                    color={getVariantColor(note.variant, theme).text}
                                  >
                                    {note.note}
                                  </Typography>
                                </Grid>
                              )
                            })
                          )}
                          </Grid>
                        </Box>
                      )
                    }

                  </Grid>
                )
              })}
            </Grid>
          )
        })
      )}
    </Grid>
    </>
  )
}

export default CalendarDayView