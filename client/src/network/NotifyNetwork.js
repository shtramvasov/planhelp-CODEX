import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getNotifyList({limit, offset}, cb = () => {}) {
    const response = await fetch(`/api/secure/notify?limit=${limit}&offset=${offset}`, {
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

export async function readAllNotify({}, cb = () => {}) {
    const response = await fetch(`/api/secure/notify/readall`, {
        method: 'post',
        headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}