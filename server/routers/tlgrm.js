const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');
const userModel = require('../models/ref_users');
const fetch = require('node-fetch');
const config = require('../config');

router.post('/', async (req, res, next) => {
    try {
	console.log(req.body);
	const telegram_chat_id = req.body.message.chat.id;
	console.log(telegram_chat_id);
	const response = await fetch(`${config.telegram_bot_url}sendMessage?chat_id=${telegram_chat_id}&text=${telegram_chat_id}`);

	res.send({ok:true});
    } catch(err) {
	console.log(err);
    }
    
});

module.exports = router;