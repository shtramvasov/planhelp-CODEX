var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var entityModel = require('../models/disk_entity');

// Возвращает указанный эелемент и его детей
// Если параметр не задан, возвращает что лежит в корне
// req.query.search 
router.get('/:entity_id?', async (req, res, next) => {
    const { entity_id } = req.params;
    const search = req.query.search?.replace(" ","%");
    let con;
    try {
        con = await mysql.getConnection();
        let rootEntity = await entityModel.getEntity(
            {entity_id, user_id : req.userModel.user_id},con
        );
        if (search) {
            rootEntity.childEntityList = await entityModel.getEntitySearch(
                {search, user_id : req.userModel.user_id},con
            );
        }
        if (!search && (rootEntity.entity_type === "PATH" || rootEntity.entity_type === "ROOT")) {
            rootEntity.childEntityList = await entityModel.getEntityChild(
                {entity_id, user_id : req.userModel.user_id},con
            );
        }
        res.send(rootEntity);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Возвращает по указанному эелементу его историю изменений
router.get('/:entity_id/activity', async (req, res, next) => {
    const { entity_id } = req.params;
    let con;
    try {
        con = await mysql.getConnection();
        entityActivity = await mysql.query(con, 
            `select dea.*,
                    u.login
               from disk_entity_activity dea inner join ref_users u on dea.created_by = u.user_id
              where dea.entity_id = ?
              order by created_on desc`,
              [ entity_id ]);
        res.send(entityActivity);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Возвращает по указанному эелементу его пред версию
router.get('/:entity_id/activity/:activity_id', async (req, res, next) => {
    const { entity_id, activity_id } = req.params;
    let con;
    try {
        con = await mysql.getConnection();
        entityActivityOld = (await mysql.query(con, 
            `select * 
               from disk_entity_activity dea
              where dea.entity_id = ?
                and dea.activity_id = ?`,
              [ entity_id, activity_id ]))[0];
        res.send(entityActivityOld);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Сохраняет новую папку или новый файл
router.post('/', async (req, res, next) => {
    let con;
    let parent;
    let parentUsers;
    try {
        const { entity_name, entity_type, entity_note, parent_entity_id } = req.body;
        if (!entity_name || !entity_type) throw "No entity_name or entity_type in data";
        con = await mysql.getConnection();
        await mysql.begin(con);
        // смотрим на уровень выше для получения дефолтных прав и построения денормализованного дерева
        if (parent_entity_id) {
            // блокируем запись, вдруг она кем то процессится в данный момент
            parent = (await mysql.query(con, 
              `select entity_tree
                 from disk_entity
                where entity_id = ?
                  for update`, [ parent_entity_id ]))[0];
            parentUsers = await mysql.query(con, 
              `select user_id, user_role
                 from disk_entity_users
                where entity_id = ?
                  for update`, [ parent_entity_id ])
        } else {
            parentUsers = [{user_id : req.userModel.user_id, user_role : "OWNER"}];
        }
        const entityTree = parent_entity_id ? parent.entity_tree /*+ '/'*/ : "";
        // Создаем головную запись
        await mysql.query(con, 
            `insert into disk_entity(
                entity_name, 
                entity_note, 
                entity_type, 
                parent_entity_id, 
                created_by, 
                created_on, 
                is_deleted,
                entity_tree)
            values(
                ?,
                ?,
                ?,
                ?,
                ?,
                now(),
                'N',
                ?
                )`,
            [ entity_name, entity_note, entity_type, parent_entity_id, req.userModel.user_id, entityTree ] );
        const entity_id = (await mysql.query(con,`select LAST_INSERT_ID() entity_id`))[0].entity_id;
        // присваиваем денормализованное дерево вложенности
        await mysql.query(con,
            `update disk_entity set entity_tree = concat(entity_tree, ?, '/') where entity_id = ?`,
            [ entity_id, entity_id ]);
        // устанавливаем права на созданный entity
        for (const userRole of parentUsers) {
            await mysql.query(con,
                `insert into disk_entity_users(entity_id, user_id, user_role) values(?,?,?)`,
                [ entity_id, userRole.user_id, userRole.user_role ]);
        }
        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

// Изменяет папку или файл
router.post('/:entity_id', async (req, res, next) => {
    let con;
    try {
        const { entity_name, entity_note } = req.body;
        const { entity_id } = req.params;
        con = await mysql.getConnection();
        await mysql.begin(con);
        const oldEntity = (await mysql.query(con, 
            `select entity_name, entity_note from disk_entity where entity_id = ?`, [ entity_id ]))[0];
        if (oldEntity.entity_note != entity_note || oldEntity.entity_name != entity_name) {
            await mysql.query(con, 
                `insert into disk_entity_activity(entity_id, entity_note_old, entity_name_old, created_by, created_on)
                values(?,?,?,?,now())`,
                [ entity_id, oldEntity.entity_note, oldEntity.entity_name, req.userModel.user_id ]);
        }
        await mysql.query(con, 
            `update disk_entity set entity_name = ?, entity_note = ? where entity_id = ?`,
            [ entity_name, entity_note, entity_id ] );
        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

// Удаление папки или файла
router.delete('/:entity_id', async (req, res, next) => {
    let con;
    try {
        const { entity_id } = req.params;
        con = await mysql.getConnection();
        await mysql.begin(con);
        await mysql.query(con, 
            `update disk_entity set is_deleted = 'Y' where entity_id = ?`,
            [ entity_id ] );
        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});



module.exports = router;