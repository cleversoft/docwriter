var mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    categorySchema = new Schema({
        name:     { type: String, default: '' },
        slug:     { type: String, default: '' },
        position: { type: Number, default: 0 }
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

module.exports = mongoose.model('category', categorySchema, 'category');