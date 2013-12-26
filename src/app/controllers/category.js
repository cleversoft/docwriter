var mongoose = require('mongoose'),
    Category = mongoose.model('category');

exports.index = function(req, res) {
    Category.find({}, function(err, categories) {
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
        return res.json({
            result: 'error'
        });
    }
    Category.count(function(err, total) {
        category.position = total;
        category.save(function(err) {
            return res.json({
                result: err ? 'error' : 'ok',
                id: err ? null : category._id
            });
        });
    });
};

/**
 * Generate slug
 */
exports.slug = function(req, res) {
    var category = new Category({
        _id: req.body.id,
        name: req.body.name
    });
    Category.generateSlug(category, function(slug) {
        res.json({
            slug: slug
        });
    });
};