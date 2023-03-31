const express = require("express");
const path = require("path");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const config = require('./config');

const diskRouter = require('./routers/disk');
const userRouter = require('./routers/user');
const loginRouter = require('./routers/login');
const notifyRouter = require('./routers/notify');
const tlgrmRouter = require('./routers/tlgrm');
const fileRouter = require('./routers/file');
const auth = require('./auth');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(fileUpload({
    createParentPath: true,
    tempFileDir : '/tmp/',
    debug : true
}));
app.use('/api/secure',auth);
app.use('/api/secure/disk', diskRouter);
app.use('/api/secure/user', userRouter);
app.use('/api/secure/notify', notifyRouter);

app.use('/api/login',loginRouter);
app.use('/api/telegram',tlgrmRouter);

app.use('/api/file',fileRouter);

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
