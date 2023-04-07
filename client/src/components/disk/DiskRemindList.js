import { Container, Button, Row, Col, Form, Table } from "react-bootstrap";
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import moment from 'moment-timezone';
import 'moment/locale/ru';
moment.locale('ru');

function DiskRemindList(props) {
    // useEffect(() => {
    //     // fetchEntity();
    //     // fetchEntityNoteList();
    // },[]);

    const remindNoteList = props.remindNoteList.map((note) => {
       return  <li key={note.note_id}>
            {/* <a target="_blank" href="https://www.totoprayogo.com/#">{note.entity_name}</a>  */}
            <small>{moment(note.remind_on,'YYYY-MM-DDTHH:mm:ss.SSSZ').format('Do MMMM YYYY, в HH:mm')}</small>
            <br/>
            <small><a className="phLink" href={`/disk/${note.entity_id}/file/read`}>{note.entity_name}</a></small>
            <p>{note.note}</p>
            
        </li>
    })
    
    return (<>
        <ul className="timeline">
            {remindNoteList}
        </ul>
    </>)
}

export default DiskRemindList;