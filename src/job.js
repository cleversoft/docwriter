var
    env         = process.env.NODE_ENV || 'development',
    config      = require('./config/config')[env],
    redis       = require('redis'),
    redisClient = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1'),
    kue         = require('kue'),
    jobs        = kue.createQueue();

jobs.process('exportPdf', function(job, done) {
    console.log(job.data);

    redisClient.publish('jobs', JSON.stringify({
        queue: 'exportPdf',
        id: job.data.id
    }));

    done();
});

/*
var process = require('child_process'),
    cmd     = 'pwd';
process.exec(cmd, function(err, stdout, stderr) {
    console.log(err);
    console.log(stdout);
    console.log(stderr);
});
*/