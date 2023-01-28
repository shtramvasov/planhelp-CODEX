import fetch from 'node-fetch'
import Cookies from 'js-cookie';

export async function getDiskEntity({entity_id, search}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}${search?`?search=${search}`:""}`, {
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

export async function deletetDiskEntity(
    {entity_id}, cb = () => {}) {
    const response = await fetch(`/api/secure/disk/${entity_id?entity_id:""}`, {
        method: 'delete',
        headers: {
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