import { Grid, Box, IconButton, Card, Typography, useTheme, Button, Tooltip, Divider, useMediaQuery } from '@mui/material'
import { ChevronLeftRounded, ChevronRightRounded, Add, CalendarMonthRounded, CalendarViewDayRounded } from '@mui/icons-material';
import { Navbar }  from "../navbar/Navbar";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment-timezone';
import { getNoteList, postNote } from "../../network/NoteNetwork";
import { addNoteList, addNote } from "../../reducers/Note";
import 'moment/locale/ru';
import { useNavigate , useSearchParams} from "react-router-dom";
import ModalNote from "../helpers/ModalNote";
import { addNegativeMessage } from '../../reducers/App';
import DayDetail from "./DayDetail";
import CalendarMonthView from './CalendarMonthView';
import CalendarDayView from './CalendarDayView';
import { monthNames } from './calendar.utils';
moment.locale('ru');


function Calendar() {
    document.title = "Календарь | planhelp";

    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const Note = useSelector((state) => state.note);
    
    const [ searchParams ] = useSearchParams();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('lg'));
    
    const [dateArrays, setDateArrays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModalNote, setShowModalNote] = useState(false);
    const [showModalDayDetail, setShowModalDayDetail] = useState(false);
    const [displayMode, setDisplayMode] = useState('month');
    const [currentMonthDate, setCurrentMonthDate] = useState(
        // дефолтная дата либо текущая либо если есть day в query то она
        searchParams.get('day') ? new Date(searchParams.get('day')) : new Date()
    );
         

    useEffect(() => {
        // const month = 12;
        // var date = new Date(2024, month-1, 1), y = date.getFullYear(), m = date.getMonth();

        var date = currentMonthDate,  y = date.getFullYear(), m = date.getMonth();
        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 0);
        const dateArr = [];
        
        // // первая неделя - +пред месяц
        for (let i = 0; i < firstDay.getUTCDay(); i++) {
            const date = new Date(y, m, (-1)*i);
            dateArr.unshift(date);
        }
        
        // весь указанный месяц
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(y, m, i);
            dateArr.push(date);
        }

        // последняя неделя - +след месяц
        for (let i = lastDay.getUTCDay(); i < 6; i++) {
            const date = new Date(y, m, lastDay.getDate()+i-lastDay.getUTCDay()+1);
            dateArr.push(date);
        }
        
        let totalArr = [];

        for (let i = 0; i < dateArr.length/7; i++) {
            const arr = [];
            for (let a = i*7; a < (i+1)*7; a++) {
                arr.push(dateArr[a]);    
            }
            totalArr.push(arr);
        }
        setDateArrays(totalArr);
        // console.log(totalArr);
    },[currentMonthDate]);


    useEffect(() => {
      isMobileScreen ? setDisplayMode('day') : setDisplayMode('month')
    }, [isMobileScreen]);

    useEffect(() => {
        if (dateArrays.length) {
            fetchNoteList();
        }
    },[dateArrays]);

    useEffect(() => {
        const day = searchParams.get('day');
        if (day) {
            setShowModalDayDetail(true);
        }
    },[searchParams.get('day')])

    const fetchNoteList = () => {
        setIsLoading(true);
        getNoteList({
                date_start : dateArrays[0][0].toISOString(), 
                date_end : dateArrays[dateArrays.length-1][6].toISOString()
            }, 
            (err, resp) => {
                setIsLoading(false);
                if (err) {
                    // TODO err
                } else {
                    const groupByDate = {};
                    for(let i=0;i<resp.length;i++) {
                        // единый формат???
                        // в модалке не просить детали!
                        const key = moment(resp[i].remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD');
                        if (!groupByDate[key]) {
                            groupByDate[key] = [];
                        }
                        groupByDate[key].push(resp[i]);
                        
                    }
                    dispatch(addNoteList(groupByDate));
                }
            }
        );
    }

    const handleChangeMonth = (direction) => {
        // console.log((new Date()).toDateString());
        setCurrentMonthDate(
            new Date(currentMonthDate.setMonth(
                currentMonthDate.getMonth()+direction
            ))
        )
    }

    const handleDetailDay = (e, day) => {
        e.preventDefault()
        navigate(`/calendar?day=${day.getFullYear()}-${('0'+(day.getMonth()+1)).slice(-2)}-${('0'+day.getDate()).slice(-2)}`);
    }

    // Вызов модалки создания заметки
    const actionCallModalNote = (e, day) => {
        // console.log(day);
        // console.log(moment(day).format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
        e.preventDefault();
        dispatch(addNote({
            is_remind: 0, 
            remind_on : moment(day).tz('UTC').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        }));
        setShowModalNote(true);
    }

    const actionModalDayDetailCallback = () => {
        setShowModalDayDetail(false);
        navigate("/calendar");
    }

    const actionModalNoteCallback = (commonNote, action) => {
        if (action === "save" && !commonNote.remind_on) {
            dispatch(addNegativeMessage("Неверный формат даты"));
            return;
        }
        
        //moment(commonNote.remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
        setShowModalNote(false);
        // console.log(commonNote)
        // dispatch(addNote({}));
        if (!commonNote) {
            return;
        }
        
        const {note, remind_on, variant, note_id, note_type, note_2, is_deleted, is_remind} = commonNote;
        // if (!is_deleted)
        //     if (!commonNote.note) {
        //         return;
        //     }
        
        postNote({
                // entity_id : entity_id,
                note : note,
                remind_on : remind_on?
                    moment(remind_on,'YYYY-MM-DD HH:mm:ss').tz('UTC').format('YYYY-MM-DD HH:mm:ss')
                    :
                    null,
                variant : variant,
                note_id : note_id,
                // note_type : "COMMENT",
                note_2 : note_2,
                is_deleted : is_deleted,
                is_remind : is_remind
            },
            (err,resp) => {
                if (!err) {
                    fetchNoteList();
                } else {
                    // dispatch(addNegativeMessage(err));
                }
            }
        );
    }

    const onEditNote = (e,el, day) => {
        console.log(el,day);
        e.preventDefault();
        dispatch(addNote(el));
        // if (el.note_type==="COMMENT") {
        setShowModalNote(true);
        // } else {
        //     window.location.href = el.note_2;
        // }
    }

    // console.log(Note.noteList);
    // console.log(moment(dateArrays[0][0]).format('DD.MM.YYYY'))
    return (
      <Box sx={{ px: { md: 0, lg: '12px' }, mx: 'auto' }}>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Note.note}
            // conditionalRemindDateTime={false}
            // is_check={false}
            />
        <DayDetail 
            onCreateNote={actionCallModalNote}
            onEditNote={onEditNote}
            day={searchParams.get('day')}
            title={"Заметка"} 
            show={showModalDayDetail} 
            placeholder="Напишите комментарий"
            callBack={actionModalDayDetailCallback}
            />
    <Row>
        <Col>
            <Navbar />
            {/* <hr/> */}
        </Col>
    </Row>

    <Card
      variant="outlined"
      sx={{
        mt: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        px: 0,
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      <Grid sx={{ display: 'flex', flexDirection: 'column', p: 0.5, px: 2 }}>

        <Grid sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'space-between' } }}>
          <Card
            variant="outlined"
            sx={{ borderRadius: 1.2, p: 0.7, gap: 0.5, display: { xs: 'none', md: 'inline-flex' } }}
          >
            <Tooltip title="Месяц" placement='top'>
              <IconButton 
                onClick={() => setDisplayMode('month')}
                sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 'auto',  width: 'auto', p: 0.25, bgcolor: displayMode === 'month' ? theme.palette.grey[100] : 'transparent' }}
              >
                <CalendarMonthRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="День" placement='top'>
              <IconButton 
                onClick={() => setDisplayMode('day')}
                sx={{ border: 'none', borderRadius: 1, transition: 'all 0.3s ease-in-out', height: 'auto',  width: 'auto', p: 0.25, bgcolor: displayMode === 'day' ? theme.palette.grey[100] : 'transparent' }}
              >
                <CalendarViewDayRounded sx={{ fill: theme.palette.grey[400], fontSize: 18, m: 0.5 }} />
              </IconButton>
            </Tooltip>
          </Card>

          <Grid gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Предыдущий месяц" placement='top'>
              <IconButton disabled={isLoading} onClick={() => {handleChangeMonth(-1)}} sx={{ border: 'none', borderRadius: 12, transition: 'all 0.3s ease-in-out' }}>
                <ChevronLeftRounded sx={{ fill: theme.palette.grey[400] }} />
              </IconButton>
            </Tooltip>

            <Typography variant='body2' sx={{ fontSize: { xs: 16, md: 19 }, fontWeight: 500, color: theme.palette.grey[700] }} >
              {monthNames[currentMonthDate.getMonth()]+" "+currentMonthDate.getFullYear()}
            </Typography>

            <Tooltip title="Следующий месяц" placement='top'>            
              <IconButton disabled={isLoading} onClick={() => {handleChangeMonth(1)}} sx={{ border: 'none', borderRadius: 12, transition: 'all 0.3s ease-in-out' }}>
                <ChevronRightRounded sx={{ fill: theme.palette.grey[400] }} />
              </IconButton>
            </Tooltip>
          </Grid>

          <Button sx={{ display: { xs: 'none', md: 'flex' } }} onClick={(e) => {e.stopPropagation(); actionCallModalNote(e)}} startIcon={<Add />} variant='contained' color="secondary">Добавить</Button>
        </Grid>
        
      </Grid>

      <Divider sx={{ bgcolor: theme.palette.grey[400] }} />

      {displayMode === 'month' && (
        <CalendarMonthView 
          dateArrays={dateArrays} 
          isLoading={isLoading} 
          actionCallModalNote={actionCallModalNote} 
          handleDetailDay={handleDetailDay} 
          onEditNote={onEditNote} 
        />
      )}

      {displayMode === 'day' && (
        <CalendarDayView 
          dateArrays={dateArrays} 
          isLoading={isLoading} 
          actionCallModalNote={actionCallModalNote} 
          onEditNote={onEditNote} 
        />
      )}
    </Card>
  </Box>
    );
}


export default Calendar;