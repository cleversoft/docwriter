var env           = process.env.NODE_ENV || 'development',
    config        = require('./config/config')[env],

    redis         = require('redis'),
    redisClient   = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1'),
    pubSubChannel = [config.redis.namespace, 'jobs'].join(':'),

    Queue         = require(config.root + '/app/queue/queue'),
    queue         = new Queue();

queue
    .setRootJobPath(config.root)
    .setNamespace(config.redis.namespace);
queue.process('exportPdf');