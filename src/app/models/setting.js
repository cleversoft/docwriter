var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    settingSchema = new Schema({
        web_title:        { type: String, default: '' },
        web_name:         { type: String, default: '' },
        web_logo:         { type: String, default: '' }
    });

module.exports = mongoose.model('setting', settingSchema, 'setting');