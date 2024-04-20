import fetch from 'node-fetch'
import Cookies from 'js-cookie';
import conf from '../conf';

const salt = conf.salt;

const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Cookies.get("secret")}`
}

export async function getDiskEntity({entity_id, search}, cb = () => {}) {

    const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}${search?`?search=${search}`:""}`, {
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

export async function getDiskEntityActivity({entity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/activity`, {
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

export async function getDiskEntityUsers({entity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/users`, {
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

export async function deleteDiskEntityUser(
    {entity_id, user_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/users/revoke`, {
        method: 'post',
        body: JSON.stringify({entity_id: entity_id, user_id : user_id}),
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

export async function addDiskEntityUser(
    {entity_id, user_id, user_role}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/users`, {
        method: 'post',
        body: JSON.stringify({entity_id: entity_id, user_id : user_id, user_role : user_role}),
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

export async function getDiskEntityActivityOld({entity_id,activity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/activity/${activity_id}`, {
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

export async function postDiskEntity(
    {entity_id, entity_name, entity_note, parent_entity_id, entity_type}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}`, {
        method: 'post',
        body: JSON.stringify({entity_name: entity_name, entity_note : entity_note, parent_entity_id:parent_entity_id,entity_type:entity_type}),
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

export async function deleteDiskEntity(
    {selectedEntityIdList}, cb = () => {}) {
    // selectedEntityIdList массив entity_id примитивов
    const response = await fetch(`/api/secure/disk/delete/all`, {
        method: 'post',
        headers: apiHeaders,
        body : JSON.stringify(selectedEntityIdList)
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

export async function moveDiskEntity({ selectedEntityIdList, to_entity_id }, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/move/all`, 
    {
        method : "POST",
        body : JSON.stringify({to_entity_id , selectedEntityIdList}),
        headers : apiHeaders
    });
    if (response.ok) {
        cb(null,null);
    } else {
        cb(response.status + " " + response.statusText);
    }
}

// Список файлов
// export async function getFilesList(entity_id, cb = () => {}) {
//     const url = `http://92.63.103.241:3001/api/files/${entity_id}`
//     const response = await fetch(url, {
//         method: 'get',
//         headers: { 'Authorization': `Bearer ${Cookies.get("secret")}` } 
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// Скачать файл
// export async function downloadFile(file_hash, original_name) {
//     const url = `http://92.63.103.241:3001/api/files/download`
//     const path = {'path':`uploads/${file_hash}`}
//     const option = { method: 'post', headers: { 'Authorization': `Bearer ${Cookies.get("secret")}`, "Content-Type": "application/json"}, body: JSON.stringify(path) }
//     fetch(url, option)
//         .then(res => res.blob())
//         .then(data => {
//             var a = document.createElement("a");
//             a.href = window.URL.createObjectURL(data);
//             a.download = original_name;
//             a.click();
//         })

// }

// Загрузить файл 
export async function uploadFile({file}, cb = () => {}) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`/api/secure/file`, { 
        method: 'post', 
        headers: { 
            'Authorization': `Bearer ${Cookies.get("secret")}`,
        },
        body: formData,
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
}