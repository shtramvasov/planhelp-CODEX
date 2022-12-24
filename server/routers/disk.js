var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');

// Возвращает указанный эелемент и его детей
// Если параметр не задан, возвращает что лежит в корне
// req.query.search 
router.get('/:entity_id?', async (req, res, next) => {
    const { entity_id } = req.params;
    const search = req.query.search?.replace(" ","%");
    let con;
    try {
        con = await mysql.getConnection();
        let rootEntity = {
            "entity_name" : "..",
            "entity_type" : "ROOT"
        };
        if (entity_id) {
            rootEntity = (await mysql.query(con, 
                `select entity_id,
                        entity_name,
                        entity_note,
                        entity_type, 
                        parent_entity_id, 
                        created_by, 
                        created_on
                   from disk_entity 
                  where entity_id = ?`, [entity_id]))[0];
        }
        if (rootEntity.entity_type !== "FILE" && !search) {
            const childEntityList = await mysql.query(con, 
                `select entity_id,
                        entity_name, 
                        entity_type, 
                        parent_entity_id, 
                        created_by, 
                        created_on
                    from disk_entity, (select ? p_entity_id) params
                    where (parent_entity_id = params.p_entity_id or (params.p_entity_id is null and parent_entity_id is null))
                      and disk_entity.is_deleted = 'N'
                    order by entity_type desc, entity_name, entity_id`, [entity_id]);
            rootEntity.childEntityList = childEntityList;
        }
        if (search) {
            const childEntityList = await mysql.query(con, 
                `select entity_id,
                        entity_name, 
                        entity_type, 
                        parent_entity_id, 
                        created_by, 
                        created_on
                    from disk_entity, (select ? search) params
                    where (
                            upper(entity_name) like concat('%','${search}','%')
                            or 
                            upper(entity_note) like concat('%','${search}','%')
                          )
                      and disk_entity.is_deleted = 'N'
                    order by entity_type desc, entity_name, entity_id`, [search]);
            rootEntity.childEntityList = childEntityList;
        }
        res.send(rootEntity);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

// Возвращает эелементы при поиске по словам
router.get('/find/:search', async (req, res, next) => {
    const { search } = req.params;
    let con;
    try {
        con = await mysql.getConnection();
        result = [];
        if (search) {
            result = await mysql.query(con, 
                `select entity_id,
                        entity_name,
                        entity_note,
                        entity_type, 
                        parent_entity_id, 
                        created_by, 
                        created_on
                   from disk_entity, (select ? p_search) params
                  where upper(entity_name) like concat('%',upper(params.p_search),'%')`, [search]);
        }
        res.send(result);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});


// Сохраняет новую папку или новый файл
router.post('/', async (req, res, next) => {
    let con;
    try {
        const { entity_name, entity_type, entity_note, parent_entity_id } = req.body;
        if (!entity_name || !entity_type) throw "No entity_name or entity_type in data";
        con = await mysql.getConnection();
        await mysql.begin(con);
        await mysql.query(con, 
            `insert into disk_entity(entity_name, entity_note, entity_type, parent_entity_id, created_by, created_on, is_deleted)
            values(?,?,?,?,?,now(),'N')`,
            [ entity_name, entity_note, entity_type, parent_entity_id, req.userModel.user_id ] );
        const entity_id = (await mysql.query(con,`select LAST_INSERT_ID() entity_id`))[0].entity_id;
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