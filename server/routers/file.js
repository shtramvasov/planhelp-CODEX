var express = require('express');
var router = express.Router();
// const path = require("path");
const yandexS3 = require('../yandexs3');

// сохранение файла
router.post('/', async (req, res, next) => {
    try {

        console.log(req.headers);
        if(!req.files) {
            throw "No file in post body";
        }

        const file = req.files.file;
        const { mimetype, name, size, data} = file;

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
        const filename = now.getFullYear() 
            + "_" + now.getMonth()
            + "_" + now.getDate()
            + "_" + uniq+file.name;
        // const filePath = "/uploads"
        //     + "/" + now.getFullYear() 
        //     + "/" + now.getMonth()
        //     + "/" + now.getDate()
        //     + "/" + uniq+file.name;
        // file.mv(path.join(rootPath + filePath));

        await new Promise((resolve, reject) => {
            yandexS3.upload({
                filename : filename, buffer : data},(err,resp) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });
        
        // возвращаем url на файл + данные о файле
        const hostUrl = req.protocol + '://' + req.get('host') + '/api/download/3/';
        res.send({
            ok:true,
            mimetype, 
            name : name, 
            size,
            url : hostUrl + filename
        });

    } catch(err) {
        next(err);
    }
});

module.exports = router;