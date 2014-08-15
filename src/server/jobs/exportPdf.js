var env      = process.env.NODE_ENV || 'development',
    config   = require('../config/config')[env],
    util     = require('util'),
    mongoose = require('mongoose'),
    Post     = mongoose.model('post'),
    Job      = require('../queue/job');

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
    console.log(args);
    var that    = this,
        process = require('child_process'),
        command = config.jobs.exportPdf.command
                        .replace('{footer}', args.footer)
                        .replace('{url}',    args.url)
                        .replace('{dest}',   args.file);

    Post
        .findOne({ _id: args.post_id })
        .exec(function(err, post) {
            console.log(post);
            if (err || !post) {
                that.complete();
                return;
            }
            post.pdf = {
                status: 'done',
                user_id: args.user.user_id,
                username: args.user.username,
                email: args.user.email,
                date: new Date()
            };
            post.save(function(err) {
                that.complete();
                if (!err) {
                    that.socketIo.emit('/jobs/exportPdf/done', {
                        post_id: post._id,
                        user_id: post.pdf.user_id,
                        username: post.pdf.username,
                        email: post.pdf.email,
                        date: post.pdf.date
                    });
                }
            });
        });

//    process.exec(command, function(err, stdout, stderr) {
//        var redisClient = that.queue.getRedisClient();
//        redisClient.publish([that.queue.getNamespace(), 'jobs'].join(':'), JSON.stringify({
//            queue: 'exportPdf',
//            id: args.id
//        }));
//
//        that.complete();
//
////        that.socketIo.to('/jobs/exportPdf').emit('done', {
////            id: args.id
////        });
//        that.socketIo.emit('/jobs/exportPdf/done', {
//            id: args.id
//        });
//    });
};