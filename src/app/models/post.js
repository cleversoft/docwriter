var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    postSchema = new Schema({
        title:        { type: String, default: '' },
        slug:         { type: String, default: '' },
        content:      { type: String, default: '' },
        status:       { type: String, default: 'deactivated' },
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
        pdf_downloads: { type: Number, default: 0 },
        heading_styles: {
            style: { type: String, default: '111111' },
            custom_style: {
                h1: { type: String, default: 'A' },
                h2: { type: String, default: 'I' },
                h3: { type: String, default: '1' },
                h4: { type: String, default: 'a' },
                h5: { type: String, default: 'i' },
                h6: { type: String, default: '' },
                format: { type: String, default: '' }
            }
        }
    }),
    slugPlugin = require('./plugins/slug');

postSchema.plugin(slugPlugin, {
    nameField: 'title'
});

// Update the number of posts in categories which the post belongs to
postSchema.pre('save', function(next) {
    if (this.prev_categories) {
        mongoose
            .model('category')
            .update({
                _id: { $in: this.prev_categories }
            }, {
                $inc: { num_posts: -1 }
            }, {
                multi: true
            })
            .exec(function(err) {
                next();
            });
    } else {
        next();
    }
});

postSchema.post('save', function(post) {
    mongoose
        .model('category')
        .update({
            _id: { $in: post.categories }
        }, {
            $inc: { num_posts: 1 }
        }, {
            multi: true
        })
        .exec();
});

postSchema.post('remove', function(post) {
    mongoose
        .model('category')
        .update({
            _id: { $in: post.categories }
        }, {
            $inc: { num_posts: -1 }
        }, {
            multi: true
        })
        .exec();
});

module.exports = mongoose.model('post', postSchema, 'post');