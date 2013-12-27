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
        pdf_file: { type: String }
    });

// TODO: Make generateSlug as a plugin
postSchema.methods.generateSlug = function() {
    return this
                .title
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
};

postSchema.statics.generateSlug = function(post, cb) {
    var slug = post.slug ? post.slug : post.generateSlug(), schema = this;
    if (slug == '') {
        slug = '-';
    }

    var found = true,
        count = 0,
        findUntilNotFound = function() {
            schema.findOne({
                slug: slug + (count == 0 ? '' : '-' + count)
            }, function(err, t) {
                if (t == null || t._id.equals(post._id)) {
                    found = false;
                    cb(slug + (count == 0 ? '' : '-' + count));
                } else {
                    count++;
                    findUntilNotFound();
                }
            });
        };
    findUntilNotFound();
};

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