const express = require("express");
const { WebSocketServer } = require('ws');
const { createServer } = require('http');
const path = require("path");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const responseTime = require('response-time')
const fs = require('fs')
const {appState, collectStats} = require('./appState');
const config = require('./config');
// var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'});

const { onMessage } = require('./routers/websocket');
const websocket = require('./routers/websocket');
const diskRouter = require('./routers/disk');
const userRouter = require('./routers/user');
const loginRouter = require('./routers/login');
const notifyRouter = require('./routers/notify');
const tlgrmRouter = require('./routers/tlgrm');
const fileRouter = require('./routers/file');
const downloadRouter = require('./routers/download');
const commonNote = require('./routers/common_note');
const projectRouter = require('./routers/project');
const projectTaskRouter = require('./routers/project_task');
const projectTaskNoteRouter = require('./routers/project_task_note');
const chatRouter = require('./routers/chat');
// const projectSprintsRouter = require('./routers/project_sprints');
const projectTaskTimetableRouter = require('./routers/project_task_timetable');
const auth = require('./auth');

const app = express();
const server = createServer(app);

app.set('trust proxy', 'loopback') 
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(responseTime( (req, res, time) => {
    collectStats(req, res, time);
    //accessLogStream.write(logString +'\n');
}));

app.use(fileUpload({
    createParentPath: true,
    tempFileDir : '/tmp/',
    debug : true,
    defCharset: 'utf8',
    defParamCharset: 'utf8'
}));

app.use('/api/secure',auth);
app.use('/api/secure/disk', diskRouter);
app.use('/api/secure/user', userRouter);
app.use('/api/secure/notify', notifyRouter);
app.use('/api/secure/note', commonNote);
app.use('/api/secure/file',fileRouter);
app.use('/api/secure/project/task/note',projectTaskNoteRouter);
app.use('/api/secure/project/task/ptt',projectTaskTimetableRouter);
// app.use('/api/secure/project/sprints',projectSprintsRouter);
app.use('/api/secure/project/task',projectTaskRouter);
app.use('/api/secure/project',projectRouter);
app.use('/api/secure/chat', chatRouter);

app.use('/api/login',loginRouter);
app.use('/api/telegram',tlgrmRouter);
app.use('/api/download/',downloadRouter);

const options = {
    definition: {
        openapi: "3.1.0",
    },
    // servers: [
    //     { url: "http://localhost:3001" },
    // ],
    apis: [
        "./docs/*/*.yaml"
    ],
};
const specs = swaggerJsdoc(options);
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(specs));
app.get("/api/getAppStateCollectedStatistics", (req,res) => {
    res.send(appState.stats);
})

app.get("/files/*",(req,res,next) => {
    res.sendFile(path.join(__dirname+req.path));
});

app.use(express.static(path.join(__dirname, '/../client/build')));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname+'/../client/build/index.html'));
});

app.use( (err, req, res, next) => {
    if (!res.headersSent) {
        console.error(err.stack || err);
        res.status(500).send({error : err.stack || err });
    }
});

server.listen(config.http_port, () => {
    console.log(`Server start at ${config.http_port} port`);
});

const wss = new WebSocketServer({ server });
websocket.setWebSocketServer(wss);
// Add an 'isAlive' property to each new WebSocket connection
wss.on('connection', (ws) => {
    console.log("New socket connection")
    ws.isAlive = true;

    // Listen for 'pong' events from the client.
    // When a pong is received, mark the connection as alive.
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Handle incoming application-specific messages
    ws.on('message', (message) => {
        try {
            onMessage(wss, ws, JSON.parse(message));
            // Example: respond with PONG to a custom PING message if not using protocol pings
            if (message.toString() === 'PING') {
                ws.send('PONG');
            }
        } catch(err) {
            console.log(err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', console.error);
});

// Set up an interval to periodically check connection liveness
const interval = setInterval(() => {
    const onLineClients = {};
    wss.clients.forEach((ws) => {
        // If a connection hasn't responded to the last ping, terminate it
        if (!ws.isAlive) return ws.terminate();
        if (ws.isAlive && ws.userModel) {
            onLineClients[ws.userModel.user_id] = true;
        }
        // Mark the connection as potentially dead and send a ping
        ws.isAlive = false;
        ws.ping();
    });
    wss.clients.forEach((ws) => {
        if (ws.userModel && ws.readyState === 1) {
            ws.send(JSON.stringify(
                {
                    online_clients : onLineClients
                }
            ));
        }
    });
}, 2000); // Check every 10 seconds

// Stop the interval when the WebSocket server closes
wss.on('close', () => {
    clearInterval(interval);
});