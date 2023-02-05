const mysql = require('../mysqlhelper');

const getProfile = async({token}, con) => {
    return (await mysql.query(con, 
        `select ref_users.*,
                (select count(*) from notify n where n.user_id = ref_users.user_id and is_read = 0) notify_count
           from ref_users_tokens inner join ref_users on ref_users_tokens.user_id = ref_users.user_id
          where token = ?
            and is_deleted = 'N'`, 
        [ token ]
    ))[0];
}

const updateProfile = async({secret,email,telegram_chat_id,is_notify, user_id},con) => {
    await mysql.query(con, 
        `update ref_users 
            set secret = coalesce(upper(md5(?)), secret),
                email = coalesce(?, email),
                telegram_chat_id = coalesce(?, telegram_chat_id),
                is_notify = coalesce(?, is_notify)
          where user_id = ?`,
        [ secret, email, telegram_chat_id, is_notify, user_id ]);
}

const login = async({login, password}, con) => {
    return (await mysql.query(con, 
        `select *
           from (select ? p_login, ? p_password) params
                cross join ref_users
          where login = params.p_login
            and (secret = params.p_password or secret = upper(md5(params.p_password)))`,
        [login, password])
    )[0];
}

const find = async ({search}, con) => {
    return await mysql.query(con,
        `select user_id, login from ref_users where login like ? limit 30`,
        [search + "%"]
    );
}

createToken = async({user_id, token}, con) => {
    await mysql.query(con, 
        `insert into ref_users_tokens(user_id, token, is_deleted)
         values(?,?,'N')`,
        [ user_id, token ]
    );
}

module.exports = {
    getProfile,
    updateProfile,
    login,
    createToken,
    find
}