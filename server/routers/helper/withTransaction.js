var mysql = require('../../mysqlhelper');
  
module.exports = (...args) => async (req, res, next) => {  
    try {  
        res.locals.dbinstance = await mysql.getConnection();
        for (const func of args) {
            await func(req, res);
        }
        // await func(req, res);  
    } catch(err) {    
        next(err);  
    } finally {  
        res.locals.dbinstance && await mysql.releaseConnection(res.locals.dbinstance);
    }  
}  