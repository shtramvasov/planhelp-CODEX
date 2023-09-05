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