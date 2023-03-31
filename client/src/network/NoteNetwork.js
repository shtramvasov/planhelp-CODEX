import fetch from 'node-fetch'
import Cookies from 'js-cookie';


// export async function addEntityNote(
//     {entity_id, user_id, user_role}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/users`, {
//         method: 'post',
//         body: JSON.stringify({entity_id: entity_id, user_id : user_id, user_role : user_role}),
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Cookies.get("secret")}`
//         }
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

export async function getEntityNoteList({entity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/note`, {
        method: 'get',
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

export async function postEntityNote({entity_id, note, remind_on, variant, note_id, is_deleted}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id}/note/${note_id?note_id:""}`, {
        method: 'post',
        body: JSON.stringify({
            entity_id: entity_id, 
            note : note, 
            remind_on : remind_on, 
            variant : variant,
            is_deleted : is_deleted}),
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

// export async function getDiskEntity({entity_id, search}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}${search?`?search=${search}`:""}`, {
//         method: 'get',
//         headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function getDiskEntityActivity({entity_id}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/activity`, {
//         method: 'get',
//         headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function getDiskEntityUsers({entity_id}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/users`, {
//         method: 'get',
//         headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function deleteDiskEntityUser(
//     {entity_id, user_id}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/users/revoke`, {
//         method: 'post',
//         body: JSON.stringify({entity_id: entity_id, user_id : user_id}),
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Cookies.get("secret")}`
//         }
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function addDiskEntityUser(
//     {entity_id, user_id, user_role}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/users`, {
//         method: 'post',
//         body: JSON.stringify({entity_id: entity_id, user_id : user_id, user_role : user_role}),
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Cookies.get("secret")}`
//         }
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function getDiskEntityActivityOld({entity_id,activity_id}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id}/activity/${activity_id}`, {
//         method: 'get',
//         headers: {'Authorization': `Bearer ${Cookies.get("secret")}`}
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function postDiskEntity(
//     {entity_id, entity_name, entity_note, parent_entity_id, entity_type}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}`, {
//         method: 'post',
//         body: JSON.stringify({entity_name: entity_name, entity_note : entity_note, parent_entity_id:parent_entity_id,entity_type:entity_type}),
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${Cookies.get("secret")}`
//         }
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }

// export async function deletetDiskEntity(
//     {entity_id}, cb = () => {}) {
//     const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}`, {
//         method: 'delete',
//         headers: {
//             'Authorization': `Bearer ${Cookies.get("secret")}`
//         }
//     });
//     if (response.ok) {
//         const data = await response.json();
//         cb(null,data);
//     } else {
//         cb(response.status + " " + response.statusText);
//     }
// }