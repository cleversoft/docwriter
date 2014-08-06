var mongoose = require('mongoose'),
    Category = mongoose.model('category');

/**
 * List categories
 */
exports.list = function(req, res) {
    Category
        .find({})
        .sort({ position: 1 })
        .exec(function(err, categories) {
            res.json({
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
    if (!category.name) {
        return res.json({ msg: 'The name is required' });
    }
    if (!category.slug) {
        return res.json({ msg: 'The slug is required' });
    }
    Category.count(function(err, total) {
        category.position = total;
        category.save(function(err) {
            return res.json({ msg: err || 'ok' });
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
    if (!category.name) {
        return res.json({ msg: 'The name is required' });
    }
    Category.generateSlug(category, function(slug) {
        res.json({ slug: slug });
    });
};

/**
 * Get category details
 */
exports.get = function(req, res) {
    var id = req.param('id');
    Category
        .findOne({ _id: id })
        .exec(function(err, category) {
            if (err) {
                return res.json({ msg: err });
            }
            if (!category) {
                return res.json({ msg: 'The category is not found' });
            }
            return res.json({ msg: 'ok', category: category });
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
            if (err) {
                return res.json({ msg: err });
            }
            if (!category) {
                return res.json({ msg: 'The category is not found' });
            }

            category.remove(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

/**
 * Update category
 */
exports.save = function(req, res) {
    var id = req.param('id');
    Category
        .findOne({ _id: id })
        .exec(function(err, category) {
            if (err) {
                return res.json({ msg: err });
            }
            if (!category) {
                return res.json({ msg: 'The category is not found' });
            }
            category.name = req.body.name;
            category.slug = req.body.slug;
            category.save(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

// -----------------------------------------------

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
                return res.json({ result: 'error' });
            }
            Category.updatePosition(category, position, function() {
                return res.json({ result: 'ok' });
            });
        });
};