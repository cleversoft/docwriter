module.exports = exports = function slugPlugin(schema, options) {
    schema.methods.generateSlug = function() {
        var nameField = (options && options.nameField) ? options.nameField : 'name';
        return this[nameField]
                    .toString()
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/á|à|ạ|ả|ã|ă|ắ|ằ|ặ|ẳ|ẵ|â|ấ|ầ|ậ|ẩ|ẫ|ä/g, 'a')
                    .replace(/đ/g, 'd')
                    .replace(/é|è|ẹ|ẻ|ẽ|ê|ế|ề|ệ|ể|ễ/g, 'e')
                    .replace(/í|ì|ị|ỉ|ĩ/g, 'i')
                    .replace(/ó|ò|ọ|ỏ|õ|ô|ố|ồ|ộ|ổ|ỗ|ơ|ớ|ờ|ợ|ở|ỡ/g, 'o')
                    .replace(/ú|ù|ụ|ủ|ũ|ư|ứ|ừ|ự|ử|ữ/g, 'u')
                    .replace(/ý|ỳ|ỵ|ỷ|ỹ/g, 'y')
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