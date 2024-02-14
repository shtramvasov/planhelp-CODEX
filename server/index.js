const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const responseTime = require('response-time')
const fs = require('fs')
const appState = require('./appState');
const config = require('./config');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

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
const projectSprintsRouter = require('./routers/project_sprints');
const auth = require('./auth');

const app = express();

app.set('trust proxy', 'loopback') 
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(responseTime( (req, res, time) => {
    // appState.stats
    
    const logString = req.method 
        + '|' + req.baseUrl + req.route?.path
        + '|' + req.userModel?.user_id 
        + '|' + req.headers?.authorization
        + '|' + req.originalUrl 
        + '|' + res.statusCode 
        + '|' + time;
    const statsKey = req.baseUrl + req.route?.path;
    if (res.statusCode == 200) {
        if (!appState.stats.ok[statsKey]) {
            appState.stats.ok[statsKey] = { 
                totalCountCall : 0,
                avgRespTime : 0,
                maxRespTime : 0,
                minRespTime : 0,
                lastLogs : [],
                lastLaggyAvg : [],
                lastLaggy5s : [],
                lastLaggy10s : []
            }
        }
        const r = appState.stats.ok[statsKey];
        // Всего запросов
        r.totalCountCall++;
        // Последние 10 запросов
        r.lastLogs.push(logString);
        // Макс время ответа
        if (time > r.maxRespTime) {
            r.maxRespTime = time;
            // Если время ответа превысило среднее время ответа
            r.lastLaggyAvg.push(logString);
        }
        // Мин время ответа
        if (time < r.maxRespTime) {
            r.minRespTime = time;
        }
        // Дольше 5 сек
        if (time > 5000 && time < 10000) {
            r.lastLaggy5s.push(logString);
        }
        // Дольше 10 сек
        if (time > 10000) {
            r.lastLaggy10s.push(logString);
        }
        // Среднее время ответа
        r.avgRespTime = (r.avgRespTime * (r.totalCountCall - 1) + time) / r.totalCountCall;

        if (r.lastLogs.length > 10) {
            r.lastLogs.shift();
        }
        if (r.lastLaggyAvg.length > 10) {
            r.lastLaggyAvg.shift();
        }
        if (r.lastLaggy5s.length > 10) {
            r.lastLaggy5s.shift();
        }
        if (r.lastLaggy10s.length > 10) {
            r.lastLaggy10s.shift();
        }
    } else {
        // ошибки, тупо храним последние 50
        if (!appState.stats.bad[statsKey]) {
            appState.stats.bad[statsKey] = { 
                lastLogs : []
            }
        }
        const r = appState.stats.bad[statsKey];
        r.lastLogs.push(logString);
        if (r.lastLogs.length > 50) {
            r.lastLogs.shift();
        }
    }
    appState.stats.totalCountCall++;
    appState.stats.avgRespTime = (appState.stats.avgRespTime * (appState.stats.totalCountCall - 1) + time) / appState.stats.totalCountCall;
    
    // console.log(JSON.stringify(appState.stats));
    // accessLogStream.write(logString +'\n');
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
app.use('/api/secure/project/sprints',projectSprintsRouter);
app.use('/api/secure/project/task',projectTaskRouter);
app.use('/api/secure/project',projectRouter);

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
