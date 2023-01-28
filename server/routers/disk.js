var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var entityModel = require('../models/disk_entity');

// Возвращает указанный эелемент и его потомков
// Если параметр не задан, возвращает что лежит в ROOT
router.get('/:entity_id?', async (req, res, next) => {
    const { entity_id } = req.params;
    const { user_id } = req.userModel;
    const search = req.query.search?.replace(" ","%");
    let con;
    try {
        con = await mysql.getConnection();

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        const entity = await entityModel.getEntity({entity_id,user_id},con);
        if (!entity) throw 'Permission denied';

        if (search) {
            // контекстный поиск, не валидируем entity, потому что не надо
            entity.childEntityList = await entityModel.getEntitySearch({search,user_id },con);
        }

        if (!search 
            && (entity.entity_type === "PATH" || entity.entity_type === "ROOT")) {
            // Если текущий entity = Папка или ROOT элемент
            // достаем потомков
            entity.childEntityList = await entityModel.getEntityChild(
                {entity_id, user_id : req.userModel.user_id},con
            );
        }

        res.send(entity);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Возвращает по указанному эелементу его историю изменений
router.get('/:entity_id/activity', async (req, res, next) => {
    const { entity_id } = req.params;
    const { user_id } = req.userModel;
    let con;
    try {
        // Проверки
        if (!entity_id) throw "Missing entity_id in url params";

        con = await mysql.getConnection();

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        const entity = await entityModel.getEntity({entity_id,user_id},con);
        if (!entity) throw 'Permission denied';

        const entityActivity = await entityModel.getEntityActivity({entity_id,user_id}, con);
        
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
    const { user_id } = req.userModel;
    let con;
    try {
        // Проверки
        if (!entity_id ) throw "Missing entity_id in url params";
        if (!activity_id ) throw "Missing activity_id in url params";

        con = await mysql.getConnection();

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        const entity = await entityModel.getEntity({entity_id,user_id},con);
        if (!entity) throw 'Permission denied';

        entityActivityOld = await entityModel.getEntityOldVersion({entity_id, activity_id, user_id}, con);
        res.send(entityActivityOld);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Сохраняет новую папку или новый файл
router.post('/', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { entity_name, entity_type, entity_note, parent_entity_id } = req.body;
    let parentEntity;
    let con;
    try {
        // Проверки
        if (!entity_name) throw "Missing entity_name in body params";
        if (!entity_type) throw "Missing entity_type in body params";
        if (!["PATH","FILE"].includes(entity_type)) throw "Not valid entity_type in body params, only PATH or FILE";

        con = await mysql.getConnection();
        await mysql.begin(con);

        if (parent_entity_id) {
            // если создают не в ROOT а в какую то папку
            // блокируем entity for update
            parentEntity = await entityModel.getEntity({entity_id : parent_entity_id,user_id}, con, true);
            if (!parentEntity) throw 'Permission denied';
        }

        const entity_id = await entityModel.createEntity(
            {entity_name, entity_type, entity_note, parent_entity_id, user_id},
            parentEntity,
            con
        );

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
    const { entity_id } = req.params;
    const { user_id } = req.userModel;
    const { entity_name, entity_note } = req.body;
    let con;
    try {
        // Проверки
        if (!entity_id) throw "Missing entity_id in url params";

        con = await mysql.getConnection();
        await mysql.begin(con);

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        // и вешаем for update см парам true
        const entity = await entityModel.getEntity({entity_id,user_id},con, true);
        if (!entity) throw 'Permission denied';

        await entityModel.updateEntity({entity_id,user_id,entity_name,entity_note},entity,con);
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
    const { entity_id } = req.params;
    const { user_id } = req.userModel;
    let con;
    try {
        // Проверки
        if (!entity_id) throw "Missing entity_id in url params";

        con = await mysql.getConnection();
        await mysql.begin(con);
        
        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        // и вешаем for update см парам true
        const entity = await entityModel.getEntity({entity_id,user_id},con, true);
        if (!entity) throw 'Permission denied';

        await entityModel.deleteEntity({entity_id,user_id},con);
        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

router.get('/:entity_id/users', async (req,res,next) => {
    const { entity_id } = req.params;
    const { user_id } = req.userModel;
    let con;
    try {
        if (!entity_id) throw "Missing entity_id in url params";
        
        con = await mysql.getConnection();

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        const entity = await entityModel.getEntity({entity_id,user_id},con);
        if (!entity) throw 'Permission denied';

        const entityUsers = await entityModel.getEntityUsers({entity_id,user_id},con);

        res.send(entityUsers);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Добавляет права на entity
router.post('/:entity_id/users', async (req, res, next) => {
    const { entity_id } = req.params;
    const profile_user_id = req.userModel.user_id;
    const { user_id, user_role } = req.body;
    let con;
    try {
        // Проверки
        if (!entity_id) throw "Missing entity_id in url params";
        if (!user_id) throw "Missing user_id in body params";
        if (!user_role) throw "Missing user_role in body params";
        if (!["WRITE","OWNER"].includes(user_role)) throw "Not valid user_role in body params, only WRITE or OWNER";

        con = await mysql.getConnection();
        await mysql.begin(con);

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        // и вешаем for update см парам true
        const entity = await entityModel.getEntity({entity_id,user_id : profile_user_id},con, true);
        if (!entity) throw 'Permission denied';

        // только OWNERам можно раздавать права
        if (entity.user_role !== 'OWNER') throw 'Permission denied, you are not OWNER of this entity';

        await entityModel.createEntityUser({entity_tree : entity.entity_tree, user_id, user_role}, con);

        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

// Добавляет права на entity
router.post('/:entity_id/users/revoke', async (req, res, next) => {
    const { entity_id } = req.params;
    const profile_user_id = req.userModel.user_id;
    const { user_id } = req.body;
    let con;
    try {
        // Проверки
        if (!entity_id) throw "Missing entity_id in url params";
        if (!user_id) throw "Missing user_id in body params";

        con = await mysql.getConnection();
        await mysql.begin(con);

        // получаем сам entity по ID
        // валидируем доступ если entity не найден - значит нет доступа
        // и вешаем for update см парам true
        const entity = await entityModel.getEntity({entity_id,user_id : profile_user_id},con, true);
        if (!entity) throw 'Permission denied';

        // только OWNERам можно раздавать права
        if (entity.user_role !== 'OWNER') throw 'Permission denied, you are not OWNER of this entity';

        await entityModel.revokeEntityUser({entity_tree : entity.entity_tree, user_id}, con);

        res.send({entity_id : entity_id});
    } catch(err) {
        con && await mysql.rollback(con);
        next(err);
    } finally {
        con && await mysql.commit(con) && await mysql.releaseConnection(con);
    }
});

module.exports = router;