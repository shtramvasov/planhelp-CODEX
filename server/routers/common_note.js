var express = require('express');
var router = express.Router();
var mysql = require('../mysqlhelper');
var commonNote = require('../models/common_note');

// Список уведомлений вобще всех ????
router.get('/', async (req, res, next) => {
    const { user_id } = req.userModel;
    const { limit, offset } = req.query;
    let con;
    try {
        con = await mysql.getConnection();

        throw "not released";

        // const noteList = await commonNote.getNoteList({
        //     user_id, entity_id, limit : limit?limit:50, offset : offset?offset:0}, con);

        res.send(noteList);
    } catch(error) {
        next(error);
    } finally {
        con && await mysql.releaseConnection(con);
    }
});

module.exports = router;