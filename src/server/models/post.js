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
            { type: Schema.ObjectId, ref: 'category' }
        ],
        pdf_downloads:  { type: Number, default: 0 },
        heading_styles: { type: String, default: '______' },
        like:           { type: Number, default: 0 },
        dislike:        { type: Number, default: 0 },
        views:          { type: Number, default: 0 },
        pdf: {
            status:   { type: String },
            user_id:  { type: Schema.ObjectId, ref: 'user' },
            username: { type: String },
            email:    { type: String },
            date:     { type: Date }
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

postSchema.post('save', function(post) {
    post.exportPdf();
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

postSchema.methods.exportPdf = function() {
    // Export to PDF as background job
    if (this.status === 'activated') {
        var config = mongoose.get('config'),
            Queue  = require(config.root + '/queue/queue'),
            queue  = new Queue(config.redis.host, config.redis.port);

        queue.setNamespace(config.redis.namespace);
        queue.enqueue('exportPdf', '/jobs/exportPdf', {
            post_id: this._id,
            url: config.app.url + '/post/preview/' + this.slug,
            file: config.jobs.exportPdf.dir + '/' + this.slug + '.pdf',
            user_id: this.pdf.user_id,
            username: this.pdf.username,
            email: this.pdf.email,
            date: this.pdf.date
        });
    }
};

module.exports = mongoose.model('post', postSchema, 'post');