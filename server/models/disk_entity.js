const mysql = require('../mysqlhelper');
const Model = require('./Model');

class DiskEntity extends Model {

    static fields = [
        "entity_id",
        "entity_name",
        "entity_note",
        "entity_type",
        "parent_entity_id",
        "created_by",
        "created_on",
        "is_deleted",
        "entity_tree"
    ]

    static table = "disk_entity";

static CONSTANTS = {
    // роль только читать
    READ : "READ",
    // роль писать но не управлять (нельзя добавлять новых юзеров в правах / нельзя удалять все комменты у entity)
    WRITE : "WRITE",
    // роль владелец, может все
    OWNER : "OWNER",

    // тип entity FILE - файл, содержит текст / не имеет потомков
    FILE : "FILE",
    // тип entity PATH - папка, не содержит текст / имеет потомков
    PATH : "PATH",
    // ROOT элемент
    ROOT : "ROOT",
    GRID : "GRID"
}

// Детализация disk_entity
//  entity_id - entity детали
//  user_id - юзер, для которого надо проверить доступ до этого entity
//  forUpdate - для блокирования записи
static getEntity = async ({entity_id, user_id}, con, forUpdate = false) => {
    if (!entity_id) {
        return {
            "entity_name" : "..",
            "entity_type" : this.CONSTANTS.ROOT,
            "entity_tree" : ""
        };
    }
    let sql = 
        `select de.entity_id,
                    de.entity_name,
                    de.entity_note,
                    de.entity_type, 
                    parent_deu.entity_id parent_entity_id, 
                    de.created_by, 
                    de.created_on,
                    de.entity_tree,
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
                    -- если папка расшарена, то родителя показывать нелья
                    -- если к нему нет доступа
                    left join disk_entity_users parent_deu 
                            on parent_deu.entity_id = de.parent_entity_id
                            and parent_deu.user_id = params.p_user_id
            where de.is_deleted = 'N'`;
    if (forUpdate) {
        // Если надо заблокировать для атомарной транзакции
        sql += ` for update `;
    }
    return (await mysql.query(con, sql, [entity_id, user_id])
    )[0];
}

// Список потомков на уровень ниже от переданного entity_id
//  entity_id - entity детали
//  user_id - юзер, для которого надо проверить доступ до этого entity
static getEntityChild = async ({entity_id, user_id}, con) => {
    let sql =
        `select 
            -- поле необходимо для определения начинается ли название на цифры
            -- далее используется в сортировке
            de.entity_name REGEXP '^[0-9]' is_decimal_name,
            de.entity_id,
            de.entity_name, 
            de.entity_type, 
            de.created_by, 
            de.created_on,
            deu.user_role,
            (select count(*) from disk_entity ch_de where ch_de.parent_entity_id = de.entity_id and ch_de.is_deleted = 'N') child_de_count
        from (select ? p_entity_id, ? p_user_id) params 
                    cross join disk_entity de 
                    inner join disk_entity_users deu 
                                on deu.entity_id = de.entity_id
                                and deu.user_id = params.p_user_id
                    -- если папка расшарена, то родителя показывать нелья
                    -- если к нему нет доступа
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
    // если имя файла начинается на цифры
    // сортируем иначе такие файлы, кастуем в decimal
    sql = sql + 
        ` and de.is_deleted = 'N'
        order by de.entity_type desc, 
                 is_decimal_name desc,
                 cast(de.entity_name as DECIMAL(8,2)),
                 de.entity_name, 
                 de.entity_id`;
    return await mysql.query(con, sql, [entity_id , user_id]);
};

// Возвращает список всех родителей от последнего по дереву
//  entity_tree - дерево ID parent_1/child_1/child_2/...etc
//  user_id - для проверки прав, чтобы не показывать родителей до которых нет доступа
static getEntityBreadcrumb = async({entity_tree, user_id}, con) => {
    if (!entity_tree) return [];
    // заменяем "/" символом ","
    const entityStrArr = entity_tree.replace(/\//g,",").slice(0,-1);
    const sql = `select de.entity_name, de.entity_id
            from disk_entity de 
        where de.entity_id in (${entityStrArr})
            and de.entity_id in (select deu.entity_id from disk_entity_users deu where deu.user_id = ?)
        order by FIELD(de.entity_id,${entityStrArr})`;
    return await mysql.query(con,sql,[user_id]);
}

// Контекстный поиск
static getEntitySearch = async ({entity_id, search, user_id}, con) => {
    const params = [];
    let sql = `select de.entity_id,
                    de.entity_name, 
                    de.entity_type, 
                    de.parent_entity_id, 
                    de.created_by, 
                    de.created_on,
                    deu.user_role
                from (select ? p_entity_id, ? p_search, ? p_user_id) params 
                        cross join disk_entity de
                        inner join disk_entity_users deu 
                            on de.entity_id = deu.entity_id
                            and deu.user_id = params.p_user_id
                where (
                        upper(de.entity_name) like concat('%',params.p_search,'%')
                        or 
                        upper(de.entity_note) like concat('%',params.p_search,'%')
                        )
                    and de.is_deleted = 'N'`;
    if (entity_id) {
        sql = sql + ` and de.entity_tree like p_entity_id `;
        params.push(entity_id +'/%');
    } else {
        params.push(null);
    }
    sql = sql + `order by de.entity_type desc, de.entity_name, de.entity_id`;
    params.push(search);
    params.push(user_id);
    return await mysql.query(con,sql,params);
}

// возвращается все элементы по дереву ниже(включая текущий)
// TODO перенести в getEntityChild
static getEntityList = async ({entity_tree}, con, forUpdate = false) => {
    const sqlParams = [];
    let sql = 
        ` select * 
            from disk_entity de
           where 1=1 `;
    if (entity_tree) {
        // если передали дерево (например когда ROOT путь - дерево undefined)
        sqlParams.push(entity_tree + '%');
        sql += ` and entity_tree like ? `;
    }
    if (forUpdate) {
        // Если надо заблокировать для атомарной транзакции
        sql += ` for update `;
    }
    return await mysql.query(con,sql,sqlParams);
}

// Получение списка всех версий изменения
static getEntityActivity = async ({entity_id, user_id}, con) => {
    return await mysql.query(con, 
        `select dea.*,
                u.login
            from disk_entity_activity dea inner join ref_users u on dea.created_by = u.user_id
            where dea.entity_id = ?
            order by created_on desc`,
        [ entity_id ]
    );
}

// Получение версии entity
static getEntityOldVersion = async ({entity_id, activity_id, user_id}, con) => {
    return (await mysql.query(con, 
        `select * 
           from disk_entity_activity dea
          where dea.entity_id = ?
            and dea.activity_id = ?`,
        [entity_id, activity_id])
    )[0];
}

// Получение всех юзеров причастных к указанному entity
static getEntityUsers = async ({entity_id, parent_entity_id, user_id, entity_tree}, con) => {
    let entityUsers = await mysql.query(con,
        `select deu.user_id, deu.user_role, u.login, u.is_notify, u.telegram_chat_id, de.entity_name, deu.entity_id
           from disk_entity_users deu inner join ref_users u on deu.user_id = u.user_id
                                      inner join disk_entity de on de.entity_id = deu.entity_id
          where deu.entity_id = ?`,
        [ entity_id ]
    );
    for (const curEntity of entityUsers) {
        // дефолтно
        curEntity.is_editable = true;
    }
    if (parent_entity_id) {
        const parentEntity = 
                await this.getEntity({entity_id : parent_entity_id,user_id},con);
        if (parentEntity) {
            const parentEntityUsers = 
                await this.getEntityUsers({entity_id:parent_entity_id,user_id},con);
                for (const curEntity of entityUsers) {
                    for (const parentEntity of parentEntityUsers) {
                        if (curEntity.user_id === parentEntity.user_id) {
                            // если у parent_entity такие же юзеры что и у текущей
                            // то не разрешаем действий по удалению прав
                            curEntity.is_editable = false;
                            continue;
                        }
                    }
                }
        }
    }
    if (entity_tree) {
        // посмотрим глубже в дерево entity и найдем все уникальные записи + пользователи
        // те у кого заполнен head_entity_id
        // то есть тут будут только те, которых нет выше по коду
        const entityUsersDeep = await mysql.query(con, 
            `SELECT deu.user_id, deu.user_role, u.login, u.is_notify, u.telegram_chat_id, de.entity_name, deu.head_entity_id entity_id
            FROM (
                 SELECT deu.user_id, deu.head_entity_id, deu.user_role
                   FROM disk_entity de inner join disk_entity_users deu on de.entity_id = deu.entity_id
                  WHERE de.entity_tree like ?
                  GROUP BY deu.user_id, deu.head_entity_id, deu.user_role
             ) deu INNER JOIN ref_users u ON deu.user_id = u.user_id
                   INNER JOIN disk_entity de on deu.head_entity_id = de.entity_id`,
            [entity_tree + '%']
        );

        // ДУБЛИ ДУБЛИ!
        for (const entityUserDeep of entityUsersDeep) {
            // редачить таких нельзя
            entityUserDeep.is_editable = false;
            let is_already_exists = false;
            for (const curEntity of entityUsers) {
            
                if (curEntity.user_id === entityUserDeep.user_id && curEntity.entity_id === entityUserDeep.entity_id ) {
                    is_already_exists = true;
                    continue;
                }
            }
            if (!is_already_exists) {
                entityUsers.push(entityUserDeep);
            }
        }
        // entityUsers = entityUsers.concat(entityUsersDeep);
    }
    return entityUsers;
}

// Удаление
static deleteEntity = async ({entity_id, user_id, entity_name, entity_type}, con) => {
    // Не уверен что это здесь должно быть
    // формируем нотификации
    const login = (await mysql.query(con,"select login from ref_users where user_id = ?",[user_id]))[0].login;
    const notify = `${login} удалил ${entity_type===this.CONSTANTS.PATH?"папку":"файл"} ${entity_name}`;
    const entityUsers = await this.getEntityUsers({entity_id, user_id}, con);
    for (const userRole of entityUsers) {
        // формируем нотификации
        if (user_id != userRole.user_id) {
            // записываем само уведомление
            await mysql.query(con,
                `insert into notify(user_id,object_id,object_type,notify_note,is_read,created_on)
                values(?,?,'disk_entity',?,0,now())`,
                [ userRole.user_id, entity_id, notify ]);
            if (userRole.is_notify && userRole.telegram_chat_id) {
                // Получаем созданный ID
                const notify_id = (await mysql.query(con,`select LAST_INSERT_ID() notify_id`))[0].notify_id;
                // пишем в журнал отправки для телеграм
                await mysql.query(con,
                    `insert into notify_tlgrm(notify_id, status, telegram_chat_id)
                    values(?,0,?)`,
                    [ notify_id, userRole.telegram_chat_id ]
                );
            }
        }
    }
    // 
    // включая все дочерние записи ниже по дереву
    return await mysql.query(con,
        `update disk_entity 
            set is_deleted = 'Y' 
          where entity_tree like 
            concat(
                (select de_head.entity_tree from (select * from disk_entity where entity_id = ?) de_head) ,'%'
            )`,
        [entity_id]
    );
}

static updateEntity = async (
    { entity_id, user_id, entity_name, entity_note, entity_type, entity_tree, parent_entity_id },
    oldEntity, 
    con) => {
    // апдейт
    let sql = `update disk_entity set `
    const sqlParams = [];
    if (entity_name !== undefined) {
        sql += ` entity_name = ?, `
        sqlParams.push(entity_name);
    }
    if (entity_note !== undefined) {
        sql += ` entity_note = ?, `
        sqlParams.push(entity_note);
    }
    if (entity_type !== undefined) {
        sql += ` entity_type = ?, `
        sqlParams.push(entity_type);
    }
    if (entity_tree !== undefined) {
        sql += ` entity_tree = ?, `
        sqlParams.push(entity_tree);
    }
    if (parent_entity_id !== undefined) {
        sql += ` parent_entity_id = ?, `
        sqlParams.push(parent_entity_id);
    }
    sql = sql.slice(0,-2)
    sql += ` where entity_id = ? `;
    sqlParams.push(entity_id);
    await mysql.query(con, sql, sqlParams);
    
    if (entity_note === undefined && entity_name === undefined) {
        return;
    }
    if (oldEntity.entity_note == entity_note 
        && oldEntity.entity_name == entity_name) {
            return
    }
    // Не уверен что это здесь должно быть
    // формируем нотификации
    const login = (await mysql.query(con,"select login from ref_users where user_id = ?",[user_id]))[0].login;
    const notify = `${login} изменил ${entity_type===this.CONSTANTS.PATH?"папку":"файл"} ${entity_name}`;
    const entityUsers = await this.getEntityUsers({entity_id, user_id}, con);
    for (const userRole of entityUsers) {
        // формируем нотификации
        if (user_id != userRole.user_id) {
            await mysql.query(con,
                `insert into notify(user_id,object_id,object_type,notify_note,is_read,created_on)
                values(?,?,'disk_entity',?,0,now())`,
                [ userRole.user_id, entity_id, notify  ]);
            if (userRole.is_notify && userRole.telegram_chat_id) {
                // Получаем созданный ID
                const notify_id = (await mysql.query(con,`select LAST_INSERT_ID() notify_id`))[0].notify_id;
                // пишем в журнал отправки для телеграм
                await mysql.query(con,
                    `insert into notify_tlgrm(notify_id, status, telegram_chat_id)
                    values(?,0,?)`,
                    [ notify_id, userRole.telegram_chat_id ]
                );
            }
        }
    }
    // таблицы пока не сохраняем
    if (entity_type !== "GRID") {
        await mysql.query(con, 
            `insert into disk_entity_activity
                (entity_id, entity_note_old, entity_name_old, created_by, created_on)
            values
                (?,?,?,?,now())`,
            [ entity_id, oldEntity.entity_note, oldEntity.entity_name, user_id ]);
    }
}

static createEntityUser = async ({head_entity_id, entity_tree, user_id, user_role}, con) => {
    await mysql.query(con,
        `insert into disk_entity_users(entity_id, user_id, user_role, head_entity_id)
          select de.entity_id, p_user_id, p_user_role, 
                 case 
                    when de.entity_id = params.head_entity_id then params.head_entity_id
                   else null 
                end
            from (select ? p_entity_tree, ? p_user_id, ? p_user_role, ? head_entity_id) params 
                 cross join disk_entity de
           where de.entity_tree like p_entity_tree`,
        [entity_tree + '%', user_id, user_role, head_entity_id]
    );
}

static revokeEntityUser = async ({entity_tree, user_id}, con) => {
    let sql = `delete from disk_entity_users where 1=1`;
    const sqlParams = [];
    if (user_id) {
        sqlParams.push(user_id);
        sql += ` and user_id = ? `;
    }
    if (entity_tree) {
        sqlParams.push(entity_tree + '%');
        sql += ` and entity_id in (select entity_id from disk_entity where entity_tree like ?) `
    }
    await mysql.query(con,sql,sqlParams);
}

static createEntity = async ({entity_name, entity_type, entity_note, parent_entity_id, user_id}, parentEntity, con) => {
    // Не уверен что это здесь должно быть
    // формируем нотификации
    let notify;
    if (parentEntity) {
        const login = (await mysql.query(con,"select login from ref_users where user_id = ?",[user_id]))[0].login;
        notify = `${login} создал ${entity_type===this.CONSTANTS.PATH?"папку":"файл"} ${entity_name} в ${parentEntity.entity_name}`;
    }
    // 

    let parentEntityUsers;

    if (parentEntity) {
        parentEntityUsers = await this.getEntityUsers({entity_id : parent_entity_id, user_id}, con);
    } else {
        parentEntityUsers = [{user_id : user_id, user_role : "OWNER"}];
    }

    // Создаем сам entity
    await mysql.query(con, 
        `insert into disk_entity(
            entity_name,entity_note,entity_type,parent_entity_id,created_by,created_on,is_deleted,entity_tree)
        values(?,?,?,?,?,now(),'N',?)`,
        [ entity_name, entity_note, entity_type, parent_entity_id, user_id, 'blank' ] );

    // Получаем созданный ID
    const entity_id = (await mysql.query(con,`select LAST_INSERT_ID() entity_id`))[0].entity_id;
    
    // формируем денормализованную вложенность
    // пример id/id/entity_id/
    const entityTree = parentEntity ? parentEntity.entity_tree + entity_id + "/" : entity_id + "/";
    await mysql.query(con,
        `update disk_entity set entity_tree = ? where entity_id = ?`,
        [ entityTree, entity_id ]
    );

    // устанавливаем права на созданный entity
    for (const userRole of parentEntityUsers) {
        await mysql.query(con,
            `insert into disk_entity_users(entity_id, user_id, user_role) values(?,?,?)`,
            [ entity_id, userRole.user_id, userRole.user_role ]);
        // формируем нотификации
        if (user_id != userRole.user_id) {
            await mysql.query(con,
                `insert into notify(user_id,object_id,object_type,notify_note,is_read,created_on)
                values(?,?,'disk_entity',?,0,now())`,
                [ userRole.user_id, entity_id, notify  ]);
            if (userRole.is_notify && userRole.telegram_chat_id) {
                // Получаем созданный ID
                const notify_id = (await mysql.query(con,`select LAST_INSERT_ID() notify_id`))[0].notify_id;
                // пишем в журнал отправки для телеграм
                await mysql.query(con,
                    `insert into notify_tlgrm(notify_id, status, telegram_chat_id)
                    values(?,0,?)`,
                    [ notify_id, userRole.telegram_chat_id ]
                );
            }
        }
        //
    }
    return entity_id;
}
}

module.exports = DiskEntity;