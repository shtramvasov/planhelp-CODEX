const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');
const userModel = require('../models/ref_users');

router.post('/', async (req, res, next) => {
    console.log(req.body);
});

module.exports = router;