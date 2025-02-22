import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function postProjectSubject({project_id, subject_id, subject_name, is_deleted, subject_type, display_variant}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/${subject_id?subject_id:""}`, {
        method: 'post',
        body: JSON.stringify({ 
            subject_name: subject_name, 
            is_deleted: is_deleted,
            subject_type : subject_type,
            display_variant : display_variant
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

export async function postProjectSubjectOrderbyTime({project_id, project_subject_list = []}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/orderbytime`, {
        method: 'post',
        body: JSON.stringify(project_subject_list),
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

export async function getProjectSubjectItemList({project_id, subject_id, limit, offset, status}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/${subject_id}/item?limit=${limit}&offset=${offset}`+
    (status?`&status=${status}`:""), {
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

export async function getProjectSubjectItem({project_id, subject_id, psi_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/${subject_id}/item/${psi_id}`, {
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

export async function getProjectSubject({project_id, subject_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/${subject_id}`, {
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

export async function postProjectSubjectItem({project_id, psi_id, subject_id, psi_name, date_start, date_end, status, psi_note}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/subject/${subject_id}/item/${psi_id?psi_id:""}`, {
        method: 'post',
        body: JSON.stringify({ 
            psi_name,
            date_start,
            date_end,
            status,
            psi_note
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