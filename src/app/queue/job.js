module.exports = Job;

function Job(queue, queueName, jobData) {
    this.queue     = queue;
    this.queueName = queueName;
    this.jobData   = jobData;
};

/**
 * Perform the job
 */
Job.prototype.perform = function(callback) {
    console.log('Processing ', this.queueName, this.jobData);

    callback();
};