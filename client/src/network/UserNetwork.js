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

export async function postUserProfile({secret}, cb = () => {}) {
    const response = await fetch(`/api/secure/user`, {
        method: 'post',
        body: JSON.stringify({secret :secret}),
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