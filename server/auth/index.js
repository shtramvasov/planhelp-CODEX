var mysql = require('../mysqlhelper');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const auth = async (req, res, next) => {
    
    console.log("==BEGIN REQUEST======================");
    console.log("req.headers.authorization:");
    console.log(req.headers.authorization);
    console.log("req.originalUrl:");
    console.log(req.originalUrl);
    console.log("req.params:");
    console.log(req.params);
    console.log("req.query:");
    console.log(req.query);
    console.log("req.body:");
    console.log(req.body);
    console.log("==END REQUEST======================");

    await sleep(500);
    
    if (!req.headers.authorization) {
        res.status(401).send({error : "Token not valid"});
        return;
        //return next("Token not valid");
    }
    const token = req.headers.authorization.slice(7);
    if (!token) {
        res.status(401).send({error : "Token not valid"});
        return;
        //return next();
    }
    // check in mysql
    let con;
    try {
        con = await mysql.getConnection();
        const result = await mysql.query(con, 
            `select ref_users.*
               from ref_users_tokens inner join ref_users on ref_users_tokens.user_id = ref_users.user_id
              where token = ?
                and is_deleted = 'N'`, [token]);
        if (!result[0]) {
            res.status(401).send({error : "Token not valid"});
            return;
        }
        req.userModel = result[0];
        next();
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }

}

module.exports = auth;