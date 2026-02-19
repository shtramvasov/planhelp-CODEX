const express = require("express");
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

app.listen(config.http_port, () => {
    console.log(`Server start at ${config.http_port} port`);
});
