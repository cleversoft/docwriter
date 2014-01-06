var redis  = require('redis'),
    Worker = require('./worker');

module.exports = Queue;

function Queue() {
    this.redisClient = redis.createClient();
};

Queue.prototype.getRedisClient = function() {
    return this.redisClient;
};

Queue.prototype.setRootJobPath = function(rootJobPath) {
    this.rootJobPath = rootJobPath;
    return this;
};

Queue.prototype.getRootJobPath = function() {
    return this.rootJobPath;
};

Queue.prototype.enqueue = function(queueName, cls, args) {
    var id = Date.now();
    // Update queues
    this.redisClient.sadd('queues', queueName);
    this.redisClient.rpush('queue:' + queueName, JSON.stringify({
        id: id,
        cls: cls,
        args: args
    }));
};

Queue.prototype.process = function(queueName, callback) {
    var worker = new Worker(this, queueName);
    worker.work(callback);
};