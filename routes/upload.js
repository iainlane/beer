var path = require('path');

var config = require(path.join(global.__basedir, 'config.json'));
var crypto = require('crypto');
var express = require('express');
var fs = require('fs');
var multer = require('multer');
var jpegrotate = require('jpeg-autorotate');
var passport = require('passport');
var redis = require(path.join(global.__basedir, 'models', 'redis'));
var url = require('url');

/* multer opts */
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var router = express.Router();

router.use(passport.initialize());
router.use(passport.session());

router.all('*', function(req, res, next) {
    if (req.user) {
        if (!config.allowed_ids.includes(req.user.id)) {
            var e = new Error('You are not allowed to access this page.');
            e.status = 401;
            return next(e);
        }
        return next();
    }

    res.redirect(url.format({
        pathname: '/auth/google',
        query: {
            "return": req.originalUrl
        }
    }));
});

router.get('/', function(req, res, next) {
    res.render('upload', { title: '&#x1F37A;' });
});


function autoRotate(req, res, next) {
    if (!req.file) {
        var err = new Error('A file must be uploaded.');
        err.status = 400;
        return next(err);
    }

    if (req.file.mimetype != "image/jpeg")
        return next();

    jpegrotate.rotate(req.file.buffer, { 'quality': 85 }, (err, buffer, orientation, dimensions) => {
        if (err) {
            if (err.code === jpegrotate.errors.correct_orientation ||
                err.code === jpegrotate.errors.no_orientation)
                return next();

            err.status = 401;
            return next(err);
        }

        req.file.buffer = buffer;

        return next();
    });
}

function writeFile(req, res, next) {
    const hash = crypto.createHash('sha256');
    hash.update(req.file.buffer);
    const digest = hash.digest('hex');
    req.file.filename = digest;
    fs.writeFile(path.join(config.imagedir, req.file.filename), req.file.buffer, (err) => {
        delete req.file.buffer;

        if (err) {
            err.status = 500;
            return next(err);
        }

        return next();
    });
}

router.post('/', upload.single('imageupload'), autoRotate, writeFile, async function(req, res, next) {
    try {
        var current = await redis.client.getAsync('current');
        var currentjson = await redis.json.get(current);
        if (!currentjson)
            currentjson = {
                image: current,
                prev: "",
                next: ""
            };
        var newjson = {
            image: req.file.filename,
            prev: current,
            next: ""
        };
        currentjson.next = newjson.image;

        await redis.client.setAsync('current', req.file.filename);
        await redis.json.set(current, currentjson);
        await redis.json.set(req.file.filename, newjson);

        res.render('upload', { title: '&#x1F37A;',
                               img: req.file.filename });
    } catch (e) {
        if (e instanceof TypeError)
            return next();
        e.status = 500;
        next(e);
    }
});

module.exports = router;
