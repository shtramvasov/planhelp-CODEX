import Cookies from 'js-cookie';

const wsSocket = {
    socket : undefined,
    onSetReadyState : () => {}, // для отслеживания изменения readyState 0 / 1
    onmessage : () => {} // обработка сообщения с сервера
};

// let socket = wsSocket.socket;

const connectWebSocket = () => {

    const wsUrl = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    wsSocket.socket = new WebSocket(wsUrl + 'planhelp.ru');
    
    wsSocket.socket.onopen = () => {
        wsSocket.socket.send(JSON.stringify({
            action : "auth",
            token : Cookies.get("secret")
        }));
        wsSocket.onSetReadyState(wsSocket.socket.readyState);
    };

    wsSocket.socket.onmessage = (event) => {
        // alert(event.data.toString())
        
        wsSocket.onmessage(event);
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
