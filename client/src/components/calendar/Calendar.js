import { Navbar }  from "../navbar/Navbar";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import Card from 'react-bootstrap/Card';
import moment from 'moment-timezone';
import { getNoteList, postNote } from "../../network/NoteNetwork";
import { addNoteList, addNote } from "../../reducers/Note";
import 'moment/locale/ru';
import { Spinner, Button } from "react-bootstrap";
import { useNavigate , useSearchParams, useParams} from "react-router-dom";
import ModalNote from "../helpers/ModalNote";
import { addPositiveMessage, addNegativeMessage } from '../../reducers/App';
import queryString from "query-string";
import DayDetail from "./DayDetail";
moment.locale('ru');

function Calendar(props) {
    
    const getFontBgColor = (variant) =>{
        switch(variant) {
            case "primary" : return "bg-primary text-white"
            case "secondary" : return "bg-secondary text-white"
            case "success" : return "bg-success text-white"
            case "danger" : return "bg-danger text-white"
            case "warning" : return "bg-warning"
            case "info" : return "bg-info"
            case "light" : return "bg-light"
            case "dark" : return "bg-dark text-white"
            default:
                return ""
        }
    }

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();
    const Note = useSelector((state) => state.note);
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь","Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const [dateArrays, setDateArrays] = useState([]);
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [showModalNote, setShowModalNote] = useState(false);
    const [showModalDayDetail, setShowModalDayDetail] = useState(false);

    document.title = "Календарь | planhelp";

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
        if (dateArrays.length) {
            fetchNoteList();
        }
    },[dateArrays]);

    useEffect(() => {
        const day = searchParams.get('day');
        if (day) {
            // dispatch(addPositiveMessage("Скоро откроются детали календаря на указанный день :). Пока не готово"))
            // navigate("/calendar");
            // console.log("searchParams",searchParams.get('day'))
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
        navigate(`/calendar?day=${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`);
    }

    // Вызов модалки создания заметки
    const actionCallModalNote = (e, day) => {
        // console.log(day);
        // console.log(moment(day).format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
        e.preventDefault();
        dispatch(addNote({
            is_remind: 1, 
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
        
        const {note, remind_on, variant, note_id, note_type, note_2, is_deleted} = commonNote;
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
                is_deleted : is_deleted
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
    <Container fluid>
        <ModalNote 
            type="textarea" 
            title={"Заметка"} 
            show={showModalNote} 
            placeholder="Напишите комментарий"
            callBack={actionModalNoteCallback}
            note={Note.note}
            is_check={false}
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
    <Row style={{paddingTop: "10px"}}>
        <Col>
        {isLoading ? 
            <Spinner/>:<>
            <a href="#" onClick={() => {handleChangeMonth(-1)}} style={{fontSize:"1.6em", color : "#555"}}>
                <i className="bi bi-arrow-left-circle"></i>
            </a>&nbsp;
            <a href="#" onClick={() => {handleChangeMonth(1)}} style={{fontSize:"1.6em", color : "#555"}}>
                <i className="bi bi-arrow-right-circle"></i>
            </a>&nbsp;&nbsp;
            </>
        }
        <h3 style={{display: "inline"}}>{monthNames[currentMonthDate.getMonth()]+" "+currentMonthDate.getFullYear()}</h3>
        </Col>
    </Row>
    <Row style={{paddingTop: "10px"}}>
        {dateArrays?.map((week,i) => {
            // console.log(week);
            return <Row key={i}>
                    {week.map((day, index) => {
                        return <Col key={index} style={{minWidth: "130px", padding : "1px", margin: "0px"}}>
                                <Card style={{
                                    minHeight:"150px",
                                    height: "150px",
                                    overflow: "auto",
                                    backgroundColor : `${
                                            (new Date()).toDateString() === day.toDateString() ? "#e6f7ed" :
                                            [5,6].includes(day.getUTCDay()) ? "#eeeeff" : ""
                                        }`
                                    }}>
                                    <Card.Body style={{fontSize: "0.8em", padding:"0px 6px 0px 6px",}}>
                                        <div
                                            style={{
                                                // fontSize: "0.8em",
                                                textAlign:"center",
                                                fontWeight: "500",
                                                marginBottom : "4px",
                                                marginTop : "4px"
                                                }}>
                                            {i===0?(moment(day).format('dd')+", "):""}
                                            {<a style={{color: "#555", textDecoration:"none"}}
                                                href={`/calendar?day=${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`} 
                                                onClick={(e) => {handleDetailDay(e, day)}}>
                                                    {day.getDate()}
                                            </a>}
                                            {/* <Button style={{padding: "0px"}} type="button" variant=""  > */}
                                                &nbsp;
                                                <i style={{cursor: "pointer"}}className="bi bi-plus-circle" onClick={(e)=>{actionCallModalNote(e,day)}}></i>
                                            {/* </Button> */}
                                        </div>
                                        {Note.noteList[moment(day).format('YYYY-MM-DD')] ? 
                                            Note.noteList[moment(day).format('YYYY-MM-DD')].map((note) => {
                                                return <div key={note.note_id}
                                                    onClick={(e)=>onEditNote(e,note)}
                                                    className={getFontBgColor(note.variant)}
                                                    style={{
                                                            padding: "4px", 
                                                            marginBottom: "1px",
                                                            fontWeight:"300",
                                                            borderRadius: "6px",
                                                            cursor: "pointer"
                                                        }}>
                                                        {moment(note.remind_on).format("HH:mm")}
                                                        &nbsp;
                                                        {note.note}
                                                </div>;
                                            })
                                        :""}
                                    </Card.Body>
                                </Card>
                            </Col>
                    })}
                </Row>
        })}
    </Row>
    </Container>
    );
}


export default Calendar;