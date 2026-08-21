var express = require('express');
var router = express.Router();
const path = require("path");
const yandexS3 = require('../yandexs3');

// Получение файла локально
router.get("*/:year/:month/:day/:file_name", async (req, res, next) => {
    try {
        const rootPath = process.env.PWD;
        
        res.sendFile(path.join(rootPath
            + "/uploads"
            + "/" + req.params.year
            + "/" +req.params.month
            + "/" + req.params.day
            + "/" + req.params.file_name), (err) => {
                console.log(err);
                next("No such file");
            });
    } catch(err) {
        next(err);
    }
});

// Получение файла yandexS3
router.get("/3/:file_name", async (req, res, next) => {
    try {
        const file = await yandexS3.get(req.params.file_name);
        // Получаем расширение файла
        const extension = req.params.file_name.split('.').pop().toLowerCase();

        // Список расширений изображений
        let notAttachExtension = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'pdf'];
        
        if (!notAttachExtension.includes(extension)) {
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(req.params.file_name)}"`);
        }
	res.setHeader('Cache-Control', 'public, max-age=86400');
        file.Body.pipe(res);
    } catch(err) {
        next(err);
    }
});

module.exports = router;