import Cookies from 'js-cookie';

const wsSocket = {
    socket : undefined,
    onSetReadyState : () => {}, // для отслеживания изменения readyState 0 / 1
    addListener : (func) => {
        console.log("new listener added");
        listener_list.push(func);
    }
};

const listener_list = [];

const connectWebSocket = () => {

    const wsUrl = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    // prod
    // wsSocket.socket = new WebSocket(wsUrl + 'planhelp.ru');
    wsSocket.socket = new WebSocket('https://planhelp.ru/');
    // dev
    // wsSocket.socket = new WebSocket(wsUrl + '192.168.88.221:3001');
    // wsSocket.socket = new WebSocket(wsUrl + 'localhost:3001');
    
    wsSocket.socket.onopen = () => {
        // wsSocket.socket.send(JSON.stringify({
        //     action : "auth",
        //     // action_id : crypto.randomUUID(),
        //     payload : {
        //         token : Cookies.get("secret")
        //     }
        // }));
        wsSocket.onSetReadyState(wsSocket.socket.readyState);
    };

    wsSocket.socket.onmessage = (event) => {        
        // wsSocket.onMessage(event);
        for (const listener of listener_list) {
            console.log("wsSocket.socket.onmessage", event.data);
            listener(event);
        }
    };

    wsSocket.socket.onclose = (event) => {
        wsSocket.onSetReadyState(wsSocket.socket.readyState);
        setTimeout(connectWebSocket, 1000); // Simple reconnect after 1 second
    };

    wsSocket.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        wsSocket.socket.close(); // Close the socket to trigger the onclose event and reconnect logic
    };
}

connectWebSocket();

export { wsSocket };
