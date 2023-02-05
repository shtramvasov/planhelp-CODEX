var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var notifyModel = require('../models/notify');

// Список уведомлений
router.get('/', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { limit, offset } = req.query;
    let con;
    try {
        con = await mysql.getConnection();

        const notifyList = await notifyModel.getNotifyList({
            user_id, limit : limit?limit:50, offset : offset?offset:0}, con);

        res.send(notifyList);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Одно уведомление
router.get('/:notify_id', async (req, res, next) => {
    const { notify_id } = req.params;
    const { user_id } = req.userModel;
    let con;
    try {
        con = await mysql.getConnection();

        const notify = await notifyModel.getNotify({
            user_id, notify_id}, con);

        res.send(notify);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// прочитать все
router.post('/readall', async (req, res, next) => {
    const { user_id } = req.userModel;
    let con;
    try {
        con = await mysql.getConnection();
        await mysql.begin(con);
        
        await notifyModel.readAllNotify({user_id}, con);

        res.send({ok:true});
    } catch(error) {
        con && await mysql.rollback(con);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

module.exports = router;