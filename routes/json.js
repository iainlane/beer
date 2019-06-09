var path = require('path');

var express = require('express');
var redis = require(path.join(global.__basedir, 'models', 'redis'));

var router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        var current = await redis.client.getAsync('current');
        console.log(current);
        l = [1,2,3,8];
        await redis.json.set('foo', l);
        var currentjson = await redis.json.get('foo');
        console.log(currentjson);
        res.json(currentjson);
    } catch (e) {
        e.status = 500;
        return next(e);
    }
});

module.exports = router;
