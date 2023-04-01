var express = require('express');
var router = express.Router();
const path = require("path");

// Получение файла
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

module.exports = router;