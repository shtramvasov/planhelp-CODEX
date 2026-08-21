import fetch from 'node-fetch'
import Cookies from 'js-cookie';
import conf from '../conf';

const salt = conf.salt;

// список диалогов
export async function getChatDialogList({}, cb = () => {}) {

    const response = await fetch(`/api/secure/chat`, {
        method: 'get',
        headers: {'Authorization': `Bearer ${Cookies.get("secret")}`,
                 sig : salt}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

// Детали диалога
export async function getChatDialog({ chat_id }, cb = () => {}) {

    const response = await fetch(`/api/secure/chat/${chat_id}`, {
        method: 'get',
        headers: {'Authorization': `Bearer ${Cookies.get("secret")}`,
                 sig : salt}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

// Удалить диалог
export async function deleteChatDialog(
    {chat_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/chat/${chat_id}`, {
        method: 'delete',
        // body: JSON.stringify({entity_id: entity_id, user_id : user_id}),
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

// Покинуть Диалог
// Удалить диалог
export async function deleteChatDialogLeave(
    {chat_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/chat/${chat_id}/leave`, {
        method: 'delete',
        // body: JSON.stringify({entity_id: entity_id, user_id : user_id}),
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

// Создать диалог
export async function postChatDialog(
    {chat_id, chat_name, user_id, chat_type, notify_status, discussion_allow}, cb = () => {}) {
    const response = await fetch(`/api/secure/chat/${chat_id?chat_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            chat_name, 
            user_id, 
            chat_type, 
            notify_status,
            discussion_allow
        }),
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

// Добавить юзера в диалог
export async function postChatDialogUser(
    {chat_id, user_id, user_role}, cb = () => {}) {
    const response = await fetch(`/api/secure/chat/${chat_id}/user`, {
        method: 'post',
        body: JSON.stringify({chat_id, user_id, user_role}),
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

// Удалить юзера из диалога
export async function deleteChatDialogUser(
    {chat_id, user_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/chat/${chat_id}/user/${user_id}`, {
        method: 'delete',
        // body: JSON.stringify({entity_id: entity_id, user_id : user_id, user_role : user_role}),
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