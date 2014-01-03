var mongoose = require('mongoose'),
    Category = mongoose.model('category');

exports.index = function(req, res) {
    Category
        .find({})
        .sort({ position: 1 })
        .exec(function(err, categories) {
            res.render('category/index', {
                title: 'Categories',
                categories: categories
            });
        });
};

/**
 * Add new category
 */
exports.add = function(req, res) {
    var category = new Category({
        name: req.body.name,
        slug: req.body.slug
    });
    if (!category.name || !category.slug) {
        return res.json({ result: 'error' });
    }
    Category.count(function(err, total) {
        category.position = total;
        category.save(function(err) {
            return res.json({
                result:   err ? 'error' : 'ok',
                id:       err ? null    : category._id,
                position: err ? null    : category.position
            });
        });
    });
};

/**
 * Update category
 */
exports.edit = function(req, res) {
    var id = req.body.id;
    Category
        .findOne({ _id: id })
        .exec(function(err, category) {
            if (err || !category) {
                return res.json({ result: 'error'});
            }
            category.name = req.body.name;
            category.slug = req.body.slug;
            category.save(function(err) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
        });
};

/**
 * Change the category position
 */
exports.order = function(req, res) {
    var id       = req.body.id,
        position = req.body.position;
    Category
        .findOne({ _id: id })
        .exec(function(err, category) {
            if (err || !category) {
                return res.json({ result: 'error'});
            }
            Category.updatePosition(category, position, function() {
                return res.json({ result: 'ok'});
            });
        });
};

/**
 * Remove category
 */
exports.remove = function(req, res) {
    var id = req.body.id;
    Category
        .findOne({ _id: id })
        .exec(function(err, category) {
            if (err || !category) {
                return res.json({ result: 'error'});
            }
            category.remove(function(err) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
        });
};

/**
 * Generate slug
 */
exports.slug = function(req, res) {
    var category = new Category({
        name: req.body.name
    });
    if (req.body.id) {
        category._id = req.body.id;
    }
    Category.generateSlug(category, function(slug) {
        res.json({ slug: slug });
    });
};