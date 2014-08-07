var util         = require('util'),
    EventEmitter = require('events').EventEmitter;

module.exports = Job;

util.inherits(Job, EventEmitter);

/**
 * Base job class for job
 *
 * @param {Queue} queue
 * @param {String} queueName
 */
function Job(queue, queueName) {
    this.queue     = queue;
    this.queueName = queueName;
};

/**
 * Perform the job.
 * The job class has to implement this method
 */
Job.prototype.perform = function(jobData) {
    // When the job is done, please call the complete() method
};

Job.prototype.complete = function() {
    this.emit('complete', this);
};