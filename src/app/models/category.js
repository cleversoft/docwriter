var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    categorySchema = new Schema({
        name:      { type: String, default: '' },
        slug:      { type: String, default: '' },
        position:  { type: Number, default: 0 },
        num_posts: { type: Number, default: 0 }
    });

categorySchema.methods.generateSlug = function() {
    return this
                .name
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
};

categorySchema.statics.generateSlug = function(category, cb) {
    var slug = category.slug ? category.slug : category.generateSlug(), schema = this;
    if (slug == '') {
        slug = '-';
    }

    var found = true,
        count = 0,
        findUntilNotFound = function() {
            schema.findOne({
                slug: slug + (count == 0 ? '' : '-' + count)
            }, function(err, t) {
                if (t == null || t._id.equals(category._id)) {
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

categorySchema.post('remove', function(category) {
    // Update the position of other categories which have larger position
    mongoose
        .model('category')
        .update({
            position: { $gte: category.position }
        }, {
            $inc: { position: -1 }
        }, {
            multi: true
        })
        .exec();

    // TODO: Remove category from posts
});

// Update the position
categorySchema.statics.updatePosition = function(category, position, callback) {
    var cb = callback || function() {};

    if (category.position == position) {
        return cb();
    }

    // Update the position of other categories which have larger/smaller position
    mongoose
        .model('category')
        .update({
            position: {
                $gte: Math.min(category.position, position),
                $lte: Math.max(category.position, position)
            }
        }, {
            $inc: { position: category.position > position ? 1 : -1 }
        }, {
            multi: true
        })
        .exec(function(err) {
            if (err) {
                return cb();
            }
            category.position = position;
            category.save(function() {
                cb();
            });
        });
};

module.exports = mongoose.model('category', categorySchema, 'category');