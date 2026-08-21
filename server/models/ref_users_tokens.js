const mysql = require('../mysqlhelper');
const Model = require('./Model');

class RefUsersTokens extends Model {

    static table = "ref_users_tokens";
}

module.exports = RefUsersTokens;