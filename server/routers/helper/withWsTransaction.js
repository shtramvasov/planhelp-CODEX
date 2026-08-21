var mysql = require('../../mysqlhelper');

module.exports = (...args) => async (webSocketServer, ws, message) => {
    let dbinstance;
    try {  
        dbinstance = await mysql.getConnection();
        await mysql.begin(dbinstance);
        for (const func of args) {
            await func(webSocketServer, ws, message, dbinstance);
        }
        await mysql.commit(dbinstance);
    } catch(err) {
        dbinstance && await mysql.rollback(dbinstance);
        throw Error(err);
    } finally {
        dbinstance && await mysql.releaseConnection(dbinstance);
    }  
} 