var redis  = require('redis'),
    Worker = require('./worker');

module.exports = Queue;

function Queue(redisHost, redisPort) {
    this.redisClient = redis.createClient(redisPort || 6379, redisHost || '127.0.0.1');
    this.namespace   = 'q';
};

Queue.prototype.getRedisClient = function() {
    return this.redisClient;
};

/**
 * @param {String} rootJobPath
 * @returns {Queue}
 */
Queue.prototype.setRootJobPath = function(rootJobPath) {
    this.rootJobPath = rootJobPath;
    return this;
};

Queue.prototype.getRootJobPath = function() {
    return this.rootJobPath;
};

/**
 * Set the Redis namespace
 *
 * @param {String} namespace
 * @return {Queue}
 */
Queue.prototype.setNamespace = function(namespace) {
    this.namespace = namespace;
    return this;
};

Queue.prototype.getNamespace = function() {
    return this.namespace;
};

Queue.prototype.enqueue = function(queueName, cls, args) {
    var id = Date.now();
    // Update queues
    this.redisClient.sadd([this.namespace, 'queues'].join(':'), queueName);
    this.redisClient.rpush([this.namespace, 'queue', queueName].join(':'), JSON.stringify({
        id: id,
        cls: cls,
        args: args
    }));
};

Queue.prototype.process = function(queueName, callback) {
    var worker = new Worker(this, queueName);
    worker.work(callback);
};