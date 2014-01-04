var Job = require('./job');

module.exports = Worker;

/**
 * @param {Queue} queue
 * @param {String} queueName
 */
function Worker(queue, queueName) {
    this.queue     = queue;
    this.queueName = queueName;
};

Worker.prototype.work = function(callback) {
    var that = this;

    this.getJob(function(err, jobData) {
        if (err || !jobData) {
            return process.nextTick(function() {
                // Try to work on the next job
                that.work(callback);
            });
        }
        jobData = JSON.parse(jobData);
        that.process(jobData, callback);
    });
};

Worker.prototype.process = function(jobData, callback) {
    var that = this,
        job  = new Job(this, this.queueName, jobData);
    job.perform(function() {
        // Start new job
        that.work(callback);
    });
};

/**
 * Get the job from stack
 *
 * @param {Function} callback
 */
Worker.prototype.getJob = function(callback) {
    var client = this.queue.getRedisClient();
    client.lpop('queue:' + this.queueName, function(err, reply) {
        callback(err, reply);
    });
};