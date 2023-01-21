const express = require('express');
const router = express.Router();
const mysql = require('../mysqlhelper');
const crypto = require('crypto');

router.post('/', async (req, res, next) => {
    let con;
    try {
        const { login, password } = req.body;
        if (!login || !password) throw "No login or password in auth data";
        
        con = await mysql.getConnection();
        await mysql.begin(con);
        const user = await mysql.query(con, 
                        `select *
                           from ref_users
                          where login = ?
                            and (secret = ? 
                                    or secret = upper(md5(?)))`,
                          [login,password,password]);
        if (!user.length) {
            res.status(401).send({ok:false});
        } else {
            const token = crypto.createHash('md5').update(
                ''+user[0].user_id + Math.floor(Date.now() / 1000)
            ).digest("hex");
            await mysql.query(con, 
                `insert into ref_users_tokens(user_id, token, is_deleted)
                values(?,?,'N')`,
                [ user[0].user_id, token ] );
            
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