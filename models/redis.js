var redis = require("redis-promisify");
var json = require("redis-json");
var client = redis.createClient();

function redisObject() {
    this.redis = redis;
    this.client = client;
    this.json = new json(this.client);
}

module.exports = new redisObject();
