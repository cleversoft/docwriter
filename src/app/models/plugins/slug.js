module.exports = exports = function slugPlugin(schema, options) {
    schema.methods.generateSlug = function() {
        var nameField = (options && options.nameField) ? options.nameField : 'name';
        return this[nameField]
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
    };

    schema.statics.generateSlug = function(model, cb) {
        var slug = model.slug ? model.slug : model.generateSlug(), schema = this;
        if (slug == '') {
            slug = '-';
        }

        var found = true,
            count = 0,
            findUntilNotFound = function() {
                schema.findOne({
                    slug: slug + (count == 0 ? '' : '-' + count)
                }, function(err, t) {
                    if (t == null || t._id.equals(model._id)) {
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
};