import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getProjectList({limit, offset}, cb = () => {}) {
    const response = await fetch(`/api/secure/project?limit=${limit}&offset=${offset}`, {
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

export async function getProject({project_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}`, {
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

export async function postProject({project_id, project_name, project_note}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id?project_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            project_name: project_name, 
            project_note : project_note}),
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

export async function addUserToProject({ project_id, selectedUserId, user_role }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/users`, {
        method: 'post',
        body: JSON.stringify({ 
            user_id: selectedUserId, 
            user_role: user_role}),
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

export async function delUserToProject({ project_id, selectedUserId, user_role }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/users/revoke`, {
        method: 'post',
        body: JSON.stringify({ 
            user_id: selectedUserId, 
            user_role: user_role}),
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

export async function getProjectTaskList(
    {limit, offset, executor_id, responsible_id, reviewer_id, status_id, status_ids, project_id }
    , cb = () => {}) {
    let url = `/api/secure/project/task/${project_id}/?`;
    limit && (url += `limit=${limit}&`)
    offset && (url += `offset=${offset}&`)
    executor_id && (url += `executor_id=${executor_id}&`)
    responsible_id && (url += `responsible_id=${responsible_id}&`)
    reviewer_id && (url += `reviewer_id=${reviewer_id}&`)
    status_id && (url += `status_id=${status_id}&`)
    status_ids && (url += `status_ids=${status_ids}&`)
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

export async function getTask({project_id, task_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/${project_id}/${task_id}`, {
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

