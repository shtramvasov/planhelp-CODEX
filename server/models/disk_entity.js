const mysql = require('../mysqlhelper');

// Детали entity
const getEntity = async ({entity_id, user_id}, con) => {
    if (!entity_id) {
        return {
            "entity_name" : "..",
            "entity_type" : "ROOT"
        };
    }
    // parent_entity_id определяется по правам доступа
    // разрешен ли родитель? если нет - возврат в корень
    return (await mysql.query(con, 
            `select de.entity_id,
                    de.entity_name,
                    de.entity_note,
                    de.entity_type, 
                    parent_deu.entity_id parent_entity_id, 
                    de.created_by, 
                    de.created_on,
                    u.login,
                    deu.user_role
               from (select ? p_entity_id, ? p_user_id) params 
                        inner join disk_entity de 
                                on params.p_entity_id = de.entity_id
                        inner join ref_users u 
                                on de.created_by = u.user_id
                        inner join disk_entity_users deu 
                                on de.entity_id = deu.entity_id 
                                and deu.user_id = params.p_user_id
                        left join disk_entity_users parent_deu 
                                on parent_deu.entity_id = de.parent_entity_id
                                and parent_deu.user_id = params.p_user_id
              where de.is_deleted = 'N'`, 
                [entity_id, user_id])
        )[0];
}

// Список потомков на уровень ниже от переданного entity_id
const getEntityChild = async ({entity_id, user_id}, con) => {
    let sql = `  select de.entity_id,
                        de.entity_name, 
                        de.entity_type, 
                        de.created_by, 
                        de.created_on,
                        deu.user_role
                    from (select ? p_entity_id, ? p_user_id) params 
                                cross join disk_entity de 
                                inner join disk_entity_users deu 
                                            on deu.entity_id = de.entity_id
                                            and deu.user_id = params.p_user_id
                                left join disk_entity_users parent_deu 
                                            on parent_deu.entity_id = de.parent_entity_id
                                            and parent_deu.user_id = params.p_user_id

                    where 1=1`;
    if (entity_id) {
        // если передали головной entity то ищем среди доступных потомков
        sql = sql + 
            ` and de.parent_entity_id = params.p_entity_id `;
    } else {
        // если не передали, ищем все головные entity
        // или по тем, по которым предоставили доступ
        sql = sql + 
            ` and parent_deu.entity_id is null `;
    }
    sql = sql + 
        ` and de.is_deleted = 'N'
        order by de.entity_type desc, de.entity_name, de.entity_id`;
    return await mysql.query(con, sql, [entity_id , user_id]);
};

const getEntitySearch = async ({search, user_id}, con) => {
    return await mysql.query(con, 
    `select entity_id,
            entity_name, 
            entity_type, 
            parent_entity_id, 
            created_by, 
            created_on
        from disk_entity de, (select ? search) params
        where (
                upper(de.entity_name) like concat('%','${search}','%')
                or 
                upper(de.entity_note) like concat('%','${search}','%')
                )
            and de.is_deleted = 'N'
    and exists (select 1 
                        from disk_entity_users deu 
                        where deu.entity_id = de.entity_id
                        and deu.user_id = ?)
        order by entity_type desc, entity_name, entity_id`, 
        [search,user_id]
    );
}

module.exports = {
    getEntityChild : getEntityChild,
    getEntity : getEntity,
    getEntitySearch : getEntitySearch
};