const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');
const userModel = require('../models/ref_users');
const fetch = require('node-fetch');
const config = require('../config');
var ProjectTask = require('../models/project_task');

router.post('/', async (req, res, next) => {
    let con;
    try {
	console.log(JSON.stringify(req.body));
	const telegram_chat_id = req.body.message.chat.id;
	if (req.body.message.chat.type === "private") {	
	    const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${telegram_chat_id}`);
	} else 
	if (req.body.message.text.startsWith("@planhelpbot так задумано")) {
	    const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI("так задумано.")}`);
	} else 
	if (req.body.message.text.startsWith("@planhelpbot это база")) {
	    const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI("это база.")}`);
	} else
	if (req.body.message.text.startsWith("@planhelpbot")) {
	    con = await mysql.getConnection();
	    const task_title = (req.body.message.text).replace("@planhelpbot ","").substring(0,64);
	    const task_note = req.body.message.text;
	    const task_id = await ProjectTask.create(con, {
                values : {
                    project_id : 33, // admin project
		    status_id : 93, // backlog status
                    task_title,task_note,is_deleted : 'N',
                    created_on : { expression : "now()" },
		    orderby_time : { expression : "UNIX_TIMESTAMP(now())" },
                    created_by : 25,  // @planhelpbot 
            	    reviewer_id : 25
		}
            });
	    const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI("Ваша заявка зафиксирована в planhelp.ru")}`);
	}
	res.send({ok:true});
    } catch(err) {
	res.send({ok:false});
	console.log(err);
    } finally {
	con && await mysql.releaseConnection(con);
    } 
    
});

module.exports = router;