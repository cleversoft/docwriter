var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    postSchema = new Schema({
        title:        { type: String, default: '' },
        slug:         { type: String, default: '' },
        content:      { type: String, default: '' },
        status:       { type: String, default: 'activated' },
        created_date: { type: Date,   default: Date.now },
        created_user: {
            username:  { type: String },
            full_name: { type: String }
        },
        updated_date: { type: Date },
        updated_user: {
            username:  { type: String },
            full_name: { type: String }
        },
        categories: [
            { type : Schema.ObjectId, ref: 'category' }
        ],
        pdf_file: { type: String }
    });

module.exports = mongoose.model('post', postSchema, 'post');