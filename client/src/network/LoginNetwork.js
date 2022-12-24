import fetch from 'node-fetch'

export async function postLogin({login, password}, cb = () => {}) {
    const response = await fetch('/api/login', {
	    method: 'post',
	    body: JSON.stringify({login: login, password :password}),
	    headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        const data = await response.json();
        cb(null,data);
    } else {
        cb(response.status + " " + response.statusText);
    }
    
}
