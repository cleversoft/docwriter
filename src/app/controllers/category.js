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