var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    searchSchema = new Schema({
        keyword:        { type: String, default: '' },
        count:          { type: Number, default: 1 }
    });
module.exports = mongoose.model('search', searchSchema, 'search');