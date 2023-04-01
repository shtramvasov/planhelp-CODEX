var express = require('express');
var router = express.Router();
const path = require("path");

// сохранение файла
router.post('/', async (req, res, next) => {
    try {

        console.log(req.headers);
        if(!req.files) {
            throw "No file in post body";
        }

        const file = req.files.file;
        const { mimetype, name, size, } = file;

        // уникальное имя файла
        const now = new Date();
        const uniq = ""  
            + now.getHours() 
            + now.getMinutes() 
            + now.getSeconds() 
            + now.getMilliseconds()
            + "_";

        // из темп места переносим в uploads
        const rootPath = process.env.PWD;
        const filePath = "/uploads"
            + "/" + now.getFullYear() 
            + "/" + now.getMonth()
            + "/" + now.getDate()
            + "/" + uniq+file.name;
        file.mv(path.join(rootPath + filePath));

        // возвращаем url на файл + данные о файле
        const hostUrl = req.protocol + '://' + req.get('host') + '/api/download';
        res.send({
            ok:true,
            mimetype, 
            name : name, 
            size,
            url : hostUrl + filePath
        });

    } catch(err) {
        next(err);
    }
});

module.exports = router;