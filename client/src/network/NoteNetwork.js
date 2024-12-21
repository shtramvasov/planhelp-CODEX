import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getEntityNoteList({entity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/note`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get("secret")}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

export async function postEntityNote({entity_id, note, remind_on, variant, note_id, is_deleted, note_type, note_2, is_remind}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/note/${note_id?note_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            entity_id: entity_id, 
            note : note, 
            remind_on : remind_on, 
            variant : variant,
            is_remind : is_remind,
            is_deleted : is_deleted,
            note_type : note_type || 'COMMENT',
            note_2 : note_2}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get("secret")}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

export async function postNote({entity_id, note, remind_on, variant, note_id, is_deleted, note_type, note_2, is_remind}, cb = () => {}) {
    const response = await fetch(`/api/secure/note/${note_id?note_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            note : note, 
            remind_on : remind_on, 
            is_remind : is_remind,
            variant : variant,
            is_deleted : is_deleted,
            note_type : note_type || 'COMMENT',
            note_2 : note_2}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get("secret")}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

export async function getNoteList({date_start, date_end}, cb = () => {}) {
    const response = await fetch(`/api/secure/note?date_start=${date_start}&date_end=${date_end}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get("secret")}`
        }
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

