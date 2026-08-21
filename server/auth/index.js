var mysql = require('../mysqlhelper');
var userModel = require('../models/ref_users');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const auth = async (req, res, next) => {
    
    console.log("==BEGIN REQUEST======================");
    console.log("req.headers['x-forwarded-for']");
    console.log(req.headers['x-forwarded-for']);
    console.log("X-Real-IP");
    console.log(req.headers['x-real-ip']);
    console.log("req.socket.remoteAddress");
    console.log(req.socket.remoteAddress);
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

    // await sleep(500);
    
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

        const user = await userModel.getProfile({token}, con);
        if (!user) {
            res.status(401).send({error : "Token not valid"});
            return;
        }
        
        req.userModel = user;
        req.token = token;
        next();
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }

}

module.exports = auth;