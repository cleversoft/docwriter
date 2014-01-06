var env    = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    redis  = require('redis'),
    Queue  = require(config.root + '/app/queue/queue'),
    queue  = new Queue(config.redis.host, config.redis.port);

queue
    .setRootJobPath(config.root)
    .setNamespace(config.redis.namespace);
queue.process('exportPdf');