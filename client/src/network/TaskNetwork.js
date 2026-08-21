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

export async function postProject({project_id, project_name, project_note, is_deleted}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id ? project_id : ""}`, {
        method: 'post',
        body: JSON.stringify({
            project_name: project_name, 
            project_note : project_note,
            is_deleted: is_deleted
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
    {limit, offset, executor_id, responsible_id, reviewer_id, tag_id, status_id, status_ids, project_id, date_start, date_end, sort, search, filter_psi_ids }
    , cb = () => {}) {
    let url = `/api/secure/project/task/${project_id}/?`;
    limit !== undefined && (url += `limit=${limit}&`)
    offset !== undefined && (url += `offset=${offset}&`)
    executor_id && (url += `executor_id=${executor_id}&`)
    responsible_id && (url += `responsible_id=${responsible_id}&`)
    reviewer_id && (url += `reviewer_id=${reviewer_id}&`)
    status_id && (url += `status_id=${status_id}&`)
    status_ids && (url += `status_ids=${status_ids}&`)
    filter_psi_ids && (url += `filter_psi_ids=${filter_psi_ids}&`)
    tag_id && (url += `tag_id=${tag_id}&`)
    date_start && (url += `date_start=${date_start}&`)
    date_end && (url += `date_end=${date_end}&`)
    sort && (url += `sort=${sort}&`)
    search && (url += `search=${search}&`)
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

export async function postTask({project_id, task_id, 
        task_title, task_note, status_id, executor_id, responsible_id, reviewer_id, prev_task_id, psi_list
    }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/${project_id}/${task_id?task_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            task_title: task_title, 
            task_note : task_note,
            status_id : status_id,
            executor_id : executor_id,
            responsible_id : responsible_id,
            reviewer_id : reviewer_id,
            prev_task_id : prev_task_id,
            psi_list : psi_list
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


export async function postTaskCommonNote({project_id, task_id, note_id, note, note_type, note_2, variant}, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/note/${project_id}/${task_id}/${note_id?note_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            note,
            note_type,
            note_2,
            variant
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

export async function postTaskTags({ project_id, task_id, tags }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/${project_id}/${task_id}/tags`, {
        method: 'post',
        body: JSON.stringify(tags),
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

export async function postTaskStatus({ project_id, name, variant, is_closed, is_deleted, status_id }, cb = () => {}) {
    
    const response = await fetch(`/api/secure/project/${project_id}/status/${status_id ? status_id : ""}`, {
        method: 'post',
        body: JSON.stringify({
            status_name: name, 
            variant : variant,
            is_closed : is_closed,
            is_deleted: is_deleted
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

export async function postProjectStatusList({ project_id, project_status_list = [] }, cb = () => {}) {
    
    const response = await fetch(`/api/secure/project/${project_id}/status/orderby`, {
        method: 'post',
        body: JSON.stringify(project_status_list),
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

export async function postProjectTag({ project_id, tag_id, tag }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/tag/${tag_id ? tag_id : ""}`, {
        method: 'post',
        body: JSON.stringify({
            tag : tag
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

export async function deleteProjectTag({ project_id, tag_id }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/${project_id}/tag/${tag_id}`, {
        method: 'delete',
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

export async function postProjectTaskTimelineStart({ project_id, task_id }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/ptt/${project_id}/${task_id}/start`, {
        method: 'post',
        body: JSON.stringify({}),
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

export async function postProjectTaskTimelineEnd({ project_id, task_id }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/ptt/${project_id}/${task_id}/end`, {
        method: 'post',
        body: JSON.stringify({}),
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

export async function deleteProjectTaskTimeline({ project_id, task_id, ptt_id }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/ptt/${project_id}/${task_id}/${ptt_id}`, {
        method: 'delete',
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

export async function postProjectTaskTimeline({ project_id, task_id, ptt_id, user_id, date_start, date_end }, cb = () => {}) {
    const response = await fetch(`/api/secure/project/task/ptt/${project_id}/${task_id}/${ptt_id ? ptt_id : ""}`, {
        method: 'post',
        body: JSON.stringify({
            user_id, date_start, date_end
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