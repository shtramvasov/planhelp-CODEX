var conf = require('../config');
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 1,
    host            : conf.db_host,
    user            : conf.db_user,
    password        : conf.db_pass,
    database        : conf.db
});

const getConnection = () => new Promise((resolve, reject) => {
    pool.getConnection(function(error, connection) {
        if (error) {
            reject(error);
        }
        // SET DEFAULT UTC time zone
        connection.query("set time_zone = '+00:00'",[], () => {
            resolve(connection);
        });
    });
});

const releaseConnection = (connection) => new Promise((resolve, reject) => {
    try {
        connection.release();
        resolve();
    } catch(error) {
        reject(error);
    }
    
});

const query = (connection, sql, values) => new Promise((resolve, reject) => {
    connection.query(sql, values, function (error, results, fields) {
        if (error) {
            reject(error);
        }
        resolve(results);
    });
});

const begin = (connection) => new Promise((resolve, reject) => {
    connection.beginTransaction(function (error) {
        if (error) {
            reject(error);
        }
        resolve(connection);
    });
});

const commit = (connection) => new Promise((resolve, reject) => {
    connection.commit(function (error) {
        if (error) {
            reject(error);
        }
        resolve(connection);
    });
});

const rollback = (connection) => new Promise((resolve, reject) => {
    connection.rollback(function (error) {
        if (error) {
            reject(error);
        }
        resolve(connection);
    });
});

module.exports = {
    pool : pool,
    getConnection : getConnection,
    query : query,
    releaseConnection : releaseConnection,
    begin : begin,
    commit : commit,
    rollback : rollback
};