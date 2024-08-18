const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');
const RefUsers = require('../models/ref_users');
const fetch = require('node-fetch');
const config = require('../config');
var ProjectTask = require('../models/project_task');

router.post('/', async (req, res, next) => {
    let con;
    try {
	console.log(JSON.stringify(req.body));
	const telegram_chat_id = req.body.message.chat.id;
	if (req.body.message.chat.type === "private") {
	    if (req.body.message.contact) {
		con = await mysql.getConnection();
		const login = req.body.message.from.first_name + "_"+req.body.message.from.last_name;
		await RefUsers.create(con, { values: {
		    login : login,
		    secret : req.body.message.contact.phone_number.slice(-4),
		    telegram_chat_id : telegram_chat_id,
		    is_notify : 1,
		    timezone : "-3:00"
		}});
		await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI(`Вы зарегистрированы. Ваш логин ${login}, ваш пароль 4 последние цифры вашего телефона`)}`);
	    } else
	    if (req.body.message.text === "/register") {
		const msg = {
		    "chat_id": telegram_chat_id,
		    "text": "Привет, чтобы зарегистрироваться необходимо нажать на кнопку \"Зарегистрироваться\"",
		    "reply_markup": {
    			"resize_keyboard": true,
    			"one_time_keyboard": false,
    			"keyboard": [
        		    [
            			{
                		    "text": "Зарегистрироваться",
                		    "request_contact": true
            			}
        		    ]
    			]
		    }
		};
		const post = {
    		    method: 'POST',
    		    headers: {
        		'Content-Type': 'application/json',
    		    },
		    body : JSON.stringify(msg)
		};
		await fetch(`${config.telegram_bot_url}sendMessage`,post);
	    } else 
	    if (req.body.message.text === "/status") {
		con = await mysql.getConnection();
		const userModel = await RefUsers.find(con, { where : {telegram_chat_id} });
		if (userModel[0]) {
		    await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI('Ваш логин: '+userModel[0].login+`. Ваш telegram_chat_id: ${telegram_chat_id}`)}`);
		} else {
		    await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${encodeURI(`Ваш аккаунт не найден. Ваш telegram_chat_id: ${telegram_chat_id}`)}`);
		}
	    }
	    //else {	
	    //	await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${telegram_chat_id}`);
	    //}
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
		const taskUrl = `<a href="https://planhelp.ru/project/33/task/${task_id}/">№${task_id} ${task_title}</a>`;
		const text = encodeURI(`Задача ${taskUrl} зафиксирована в planhelp.ru`);
	    const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${text}&parse_mode=HTML`);
	}
	res.send({ok:true});
    } catch(err) {
	res.send({ok:true});
	console.log(err);
    } finally {
	con && await mysql.releaseConnection(con);
    } 
    
});

module.exports = router;