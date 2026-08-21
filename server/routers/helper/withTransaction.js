var mysql = require('../../mysqlhelper');
  
module.exports = (...args) => async (req, res, next) => {  
    try {  
        res.locals.dbinstance = await mysql.getConnection();
        await mysql.begin(res.locals.dbinstance);
        for (const func of args) {
            await func(req, res);
        }
        await mysql.commit(res.locals.dbinstance);
        // await func(req, res);  
    } catch(err) {
        res.locals.dbinstance && await mysql.rollback(res.locals.dbinstance);
        next(err);  
    } finally {  
        res.locals.dbinstance && await mysql.releaseConnection(res.locals.dbinstance);
    }  
}  