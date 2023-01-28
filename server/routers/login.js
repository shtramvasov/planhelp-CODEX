const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');
const userModel = require('../models/ref_users');

router.post('/', async (req, res, next) => {
    let con;
    try {
        const { login, password } = req.body;
        if (!login || !password) throw "No login or password in auth data";
        
        con = await mysql.getConnection();
        await mysql.begin(con);

        const user  = await userModel.login({login, password}, con);

        if (!user) {
            res.status(401).send({ok:false});
        } else {
            // если успешный логин, генерируем токен доступа
            const token = crypto.createHash('md5').update(
                ''+user.user_id + Math.floor(Date.now() / 1000)
            ).digest("hex");

            await userModel.createToken({user_id:user.user_id, token}, con);
            
            res.send({ok:true, secret : token});
        }

    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }

});

module.exports = router;