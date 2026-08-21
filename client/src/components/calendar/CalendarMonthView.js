import { useSelector } from 'react-redux'
import { Grid, Typography, useTheme, Box, Skeleton, Divider, Tooltip } from "@mui/material";
import { AddCircleRounded } from "@mui/icons-material";
import { darken, alpha } from '@mui/material/styles';
import moment from 'moment-timezone';
import { getVariantColor } from "./calendar.utils";
moment.locale('ru');


function CalendarMonthView({ dateArrays, isLoading, actionCallModalNote, handleDetailDay, onEditNote }) {
  const theme = useTheme();
  
  const Note = useSelector((state) => state.note);

  return (
    <>
    <Grid 
      sx={{ 
        display: 'grid',  
        gridTemplateColumns: 'repeat(7, 1fr)',
        p: 0.5, 
        px: 2
      }}
    >
      {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'].map((day) => (
        <Typography 
          key={day}
          variant="body2"
          align="center"
          sx={{ 
            fontWeight: 700,
            color: day === 'Суббота' || day === 'Воскресенье' ? theme.palette.grey[400] : theme.palette.grey[700]
          }}
        >
          {day}
        </Typography>
      ))}
    </Grid>

    <Divider sx={{ bgcolor: theme.palette.grey[400] }} />

    <Grid sx={{ display: 'flex', flexDirection: 'column', my: -2  }}>
      {isLoading ? (
        Array(5).fill(0).map((_, weekIndex) => (
          <Box
            key={weekIndex}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}
          >
            {Array(7).fill(0).map((_, dayIndex) => (
              <Box
                key={dayIndex}
                sx={{
                  border: '1px solid',
                  borderColor: theme.palette.grey[100],
                  minHeight: 140,
                  maxHeight: 140,
                  p: 0.5,
                }}
              >
                <Skeleton 
                  variant="text" 
                  width={28} 
                  height={28} 
                  sx={{ ml: 'auto', mr: 0.5 }}
                />
                <Skeleton variant="text" height={30}  width="100%" sx={{ mb: 0.5 }} /> 
                <Skeleton variant="text"  height={30} width="100%" sx={{ mb: 0.5 }} /> 
                <Skeleton variant="text"  height={30} width="100%" sx={{ mb: 0.5 }} /> 
              </Box>
            ))}
          </Box>
        ))
      ) : (
        dateArrays?.map((week,i) => {

          return (
            <Grid 
              key={i}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                margin: '-1px',
              }}
            >
              {week.map((day, index) => {
                const isToday = (new Date()).toDateString() === day.toDateString();
                const isWeekend = [5, 6].includes(day.getUTCDay());

                return (
                  <Grid 
                    key={index} 
                    sx={{
                      textAlign: 'right',
                      border: `1px solid`,
                      zIndex: isToday ? 10 : 1,
                      borderRadius: '2px',
                      borderColor: isToday ? theme.palette.info.main : theme.palette.grey[100],
                      position: 'relative',
                      minHeight: 140,
                      maxHeight: 140,
                      overflow: "auto",
                      scrollbarWidth: "thin",
                      transition: 'all 0.3s ease-in-out',
                      cursor: 'pointer',
                      // "&:hover": {
                      //   bgcolor: isWeekend ? theme.palette.grey[100] : theme.palette.grey[50]
                      // },
                      bgcolor: isWeekend ? theme.palette.grey[50] : "transparent"
                    }}
                  >
                    <Grid>
                      <Tooltip title='Добавить заметку' placement='top'>
                        <AddCircleRounded 
                          onClick={(e) => {e.stopPropagation(); actionCallModalNote(e,day)}}
                          sx={{ 
                            transition: 'all 0.3s ease-in-out',
                            fill: theme.palette.info.light, 
                            "&:hover": {
                              fill: theme.palette.primary.main
                            },
                            fontSize: 18, 
                            m: 0
                          }}
                          />
                      </Tooltip>
                    
                    <Tooltip title='Посмотреть заметки за сегодня' placement='top'>
                        <Typography 
                          onClick={(e) => {e.stopPropagation(); handleDetailDay(e, day)}}
                          variant='body2' 
                          sx={{ 
                            my: 0.5, mx: 1, 
                            display: 'inline-flex', 
                            // py: isToday ? 0.4 : 0,
                            // px: isToday ? 1 : 0,
                            borderRadius: 1,
                            fontWeight: isToday ? 700 : 400,
                            transition: 'all 0.3s ease-in-out',
                            color: isWeekend ? theme.palette.grey[400] : isToday ? theme.palette.grey[700]  : theme.palette.grey[700], 
                            bgcolor: isToday ? 'transparent' : 'transparent',
                            "&:hover": {
                              color: isToday ? theme.palette.grey[900] : theme.palette.grey[900],
                              // bgcolor: isToday ? theme.palette.primary.dark : 'transparent',
                            },
                          }}
                        >
                          {day.getDate()}
                        </Typography>
                    </Tooltip>
                    </Grid>

                    <Grid>
                      {Note.noteList[moment(day).format('YYYY-MM-DD')] && (
                        Note.noteList[moment(day).format('YYYY-MM-DD')].map((note) => {
                          return (
                            <Grid 
                              onClick={(e) => {e.stopPropagation(); onEditNote(e,note)}}
                              sx={{ 
                                m: 0.5,
                                display: 'flex', 
                                textAlign: 'start',
                                gap: 1,
                                p: 0.5,
                                border: '1px solid',
                                borderRadius: 1,
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

export default CalendarMonthView