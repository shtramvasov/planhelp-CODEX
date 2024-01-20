import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getSprintList({project_id, status, limit, offset}, cb = () => {}) {
    let url = `/api/secure/project/sprints/${project_id}?`;
    limit && (url += `limit=${limit}&`);
    offset && (url += `offset=${offset}&`);
    status != undefined && (url += `status=${status}&`);
    const response = await fetch(url, {
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

export async function getSprintDetail({project_id, sprint_id}, cb = () => {}) {
    let url = `/api/secure/project/sprints/${project_id}/${sprint_id}`;
    const response = await fetch(url, {
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

export async function postSprint({project_id, sprint_id, sprint_name, date_start, date_end, is_deleted, status}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/sprints/${project_id}/${sprint_id ? sprint_id : ""}`, {
        method: 'post',
        body: JSON.stringify({
            sprint_name, date_start, date_end, is_deleted, status
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