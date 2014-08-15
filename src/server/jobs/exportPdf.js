var env    = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env],
    util   = require('util'),
    Job    = require('../queue/job');

module.exports = ExportPdf;

util.inherits(ExportPdf, Job);

/**
 * Export a post to PDF
 *
 * @param {Queue} queue
 * @param {String} queueName
 */
function ExportPdf(queue, queueName) {
    this.queue     = queue;
    this.queueName = queueName;

    var redis       = require('redis'),
        redisClient = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1');
    this.socketIo   = require('socket.io-emitter')(redisClient, {
        key: config.redis.namespace + ':socket_io'
    });
};

ExportPdf.prototype.perform = function(args) {
    var that    = this,
        process = require('child_process'),
        command = config.jobs.exportPdf.command
                        .replace('{footer}', args.footer)
                        .replace('{url}',    args.url)
                        .replace('{dest}',   args.file);

    process.exec(command, function(err, stdout, stderr) {
        var redisClient = that.queue.getRedisClient();
        redisClient.publish([that.queue.getNamespace(), 'jobs'].join(':'), JSON.stringify({
            queue: 'exportPdf',
            id: args.post_id
        }));

        that.complete();

        that.socketIo.emit('/jobs/exportPdf/done', {
            post_id: args.post_id,
            user_id: args.user_id,
            username: args.username,
            email: args.email,
            date: args.date
        });
    });
};