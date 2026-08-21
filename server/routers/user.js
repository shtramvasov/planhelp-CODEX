const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const userModel = require('../models/ref_users');
const withTransaction = require('./helper/withTransaction');
const RefUsersTokens = require('../models/ref_users_tokens');


// Возвращает профиль пользователя
router.get('/', async (req, res, next) => {
    delete req.userModel['secret'];
    res.send(req.userModel);
});

// Изменение профиля
router.post('/', async (req, res, next) => {
    const { user_id, login } = req.userModel;
    const { secret, email, telegram_chat_id, is_notify, timezone, username, avatar_url } = req.body;
    let con;
    try {
        // if (!secret) throw "Missing secret in body params";
	if (login === "operator" || login === "support" || login === "client") { 
    	    throw "Service account can't update";
        }
        con = await mysql.getConnection();
        await mysql.begin(con);

        await userModel.updateProfile({secret, email, telegram_chat_id, is_notify, timezone, user_id, username, avatar_url},con);
        res.send({ok:true});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }

});

// Изменение push_token
router.post('/token', withTransaction(async (req, res, next) => {
    const con = res.locals.dbinstance;
    const { user_id, login, token } = req.userModel;
    const { push_token } = req.body;
    
    await RefUsersTokens.update(con, {
        values : {
            push_token
        },
        where : {
            token
        }
    })
    
    res.send({ok:true});

}));

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