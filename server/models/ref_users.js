const mysql = require('../mysqlhelper');
const Model = require('./Model');

class RefUsers extends Model {

    static fields = [
        "user_id",
        "login",
        "secret",
        "email",
        "telegram_chat_id",
        "is_notify",
        "timezone"
    ]

    static table = "ref_users";

static async getProfile({token}, con) {
    return (await mysql.query(con, 
        `select ref_users.*,
                ref_users_tokens.token,
                ref_users_tokens.dev_type,
                ref_users_tokens.push_token,
                (select count(*) from notify n where n.user_id = ref_users.user_id and is_read = 0) notify_count
           from ref_users_tokens inner join ref_users on ref_users_tokens.user_id = ref_users.user_id
          where token = ?
            and is_deleted = 'N'`, 
        [ token ]
    ))[0];
}

static async updateProfile({secret,email,telegram_chat_id,is_notify, timezone, user_id, username, avatar_url},con) {
    await mysql.query(con, 
        `update ref_users 
            set secret = coalesce(upper(md5(?)), secret),
                email = coalesce(?, email),
                telegram_chat_id = telegram_chat_id,
                is_notify = coalesce(?, is_notify),
                timezone = coalesce(?, timezone),
                username = coalesce(?, username),
                avatar_url = coalesce(?, avatar_url)
          where user_id = ?`,
        [ secret, email, is_notify, timezone, username, avatar_url, user_id ]);
}

static async login({login, password}, con) {
    return (await mysql.query(con, 
        `select *
           from (select ? p_login, ? p_password) params
                cross join ref_users
          where login = params.p_login
            and (secret = params.p_password or secret = upper(md5(params.p_password)))`,
        [login, password])
    )[0];
}

static async search({search}, con) {
    return await mysql.query(con,
        `select user_id, login from ref_users where login like ? limit 500`,
        [search + "%"]
    );
}

static async createToken({user_id, token, dev_type}, con) {
    await mysql.query(con, 
        `insert into ref_users_tokens(user_id, token, is_deleted, dev_type, created_at)
         values(?,?,'N',?, now())`,
        [ user_id, token, dev_type ]
    );
}

}
module.exports = RefUsers;