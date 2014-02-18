var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    visitSchema = new Schema({
        ip: { type: String },
        time: { type: Date, default: Date.now },
        referer: { type: String, default: '' },
        userAgent: { type: String, default: '' },
        postId: { type: String }
    });

module.exports = mongoose.model('visit', visitSchema, 'visit');