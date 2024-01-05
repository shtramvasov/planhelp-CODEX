var mysql = require('../../mysqlhelper');
  
module.exports = (func) => async (req, res, next) => {  
    try {  
        res.locals.dbinstance = await mysql.getConnection();
        await func(req, res);  
    } catch(err) {    
        next(err);  
    } finally {  
        res.locals.dbinstance && await mysql.releaseConnection(res.locals.dbinstance);
    }  
}  