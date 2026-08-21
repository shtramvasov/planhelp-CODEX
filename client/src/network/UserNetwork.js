import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getUserProfile({}, cb = () => {}) {
    const response = await fetch(`/api/secure/user`, {
        method: 'get',
        headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

export async function postUserProfile({secret, email, telegram_chat_id, is_notify, timezone, username}, cb = () => {}) {
    const response = await fetch(`/api/secure/user`, {
        method: 'post',
        body: JSON.stringify({
            secret :secret, 
            email : email,
            telegram_chat_id : telegram_chat_id, 
            is_notify: is_notify,
            timezone : timezone,
            username : username
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

export async function getUsers({search}, cb = () => {}) {
    const response = await fetch(`/api/secure/user/find?search=${search}`, {
        method: 'get',
        headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}