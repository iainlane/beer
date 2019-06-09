var path = require('path');

var config = require(path.join(global.__basedir, 'config.json'));

var express = require('express');
var fs = require('fs');
var mmmagic = require('mmmagic'), Magic = mmmagic.Magic;
var redis = require(path.join(global.__basedir, 'models', 'redis'));

var router = express.Router();

router.get('/current', async (req, res, next) => {
    try {
        var current = await redis.client.getAsync('current');
        res.redirect(307, `/images/${current}`);
    } catch (e) {
        e.status = 500;
        return next(e);
    }
});

async function setContentType(req, res, next) {
    var uploadpath = path.join(config.imagedir, req.path);

    fs.access(uploadpath, fs.constants.F_OK, (err) => {
        if (err) {
            err.status = 404;
            return next(err);
        }

        var magic = new Magic(mmmagic.MAGIC_MIME_TYPE);
        magic.detectFile(uploadpath, (err, ct) => {
            if (err)
                return next(err);

            res.type(ct);
            next();
        });
    });
}

router.use('/', setContentType, express.static('uploads'));

module.exports = router;
