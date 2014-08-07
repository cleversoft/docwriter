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
};

ExportPdf.prototype.perform = function(args) {
    var that    = this,
        process = require('child_process'),
        command = config.jobs.exportPdf.command
                        .replace('{footer_template}', config.jobs.exportPdf.footerTemplate)
                        .replace('{preview_url}',     args.url)
                        .replace('{pdf_path}',        args.file);

    process.exec(command, function(err, stdout, stderr) {
        var redisClient = that.queue.getRedisClient();
        redisClient.publish([that.queue.getNamespace(), 'jobs'].join(':'), JSON.stringify({
            queue: 'exportPdf',
            id: args.id
        }));

        that.complete();
    });
};