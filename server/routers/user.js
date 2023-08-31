const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const userModel = require('../models/ref_users');

// Возвращает профиль пользователя
router.get('/', async (req, res, next) => {
    delete req.userModel['secret'];
    res.send(req.userModel);
});

// Изменение профиля
router.post('/', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { secret, email, telegram_chat_id, is_notify, timezone } = req.body;
    let con;
    try {
        // if (!secret) throw "Missing secret in body params";

        con = await mysql.getConnection();
        await mysql.begin(con);

        await userModel.updateProfile({secret, email, telegram_chat_id, is_notify, timezone, user_id},con);
        res.send({ok:true});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }

});

router.get('/find', async (req, res, next) => {
    const { search } = req.query;
    let con;
    try {
        con = await mysql.getConnection();

        const users = await userModel.search({search}, con);
        res.send(users);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

module.exports = router;