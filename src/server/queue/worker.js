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
    var that        = this,
        JobClass    = require(this.queue.getRootJobPath() + jobData.cls),
        jobInstance = new JobClass(this.queue, this.queueName);

    jobInstance.on('complete', function() {
        // Start new job
        that.work(callback);
    });
    jobInstance.perform(jobData.args);
};

/**
 * Get the job from stack
 *
 * @param {Function} callback
 */
Worker.prototype.getJob = function(callback) {
    var client = this.queue.getRedisClient();
    client.lpop([this.queue.getNamespace(), 'queue', this.queueName].join(':'), function(err, reply) {
        callback(err, reply);
    });
};