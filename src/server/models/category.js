var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    categorySchema = new Schema({
        name:      { type: String, default: '' },
        slug:      { type: String, default: '' },
        position:  { type: Number, default: 0 },
        num_posts: { type: Number, default: 0 }
    }),
    slugPlugin     = require('./plugins/slug');

categorySchema.plugin(slugPlugin, {
    nameField: 'name'
});

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