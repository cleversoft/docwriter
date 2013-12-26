var mongoose = require('mongoose'),
    Category = mongoose.model('category'),
    Post     = mongoose.model('post');

exports.index = function(req, res) {
    res.render('post/index', {
        title: 'Posts'
    });
};

/**
 * Add new post
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var post = new Post({
            title: req.body.title,
            slug: req.body.slug,
            content: req.body.content,
            created_user: {
                username: req.session.user.username,
                full_name: req.session.user.full_name
            },
            categories: req.body.categories || []
        });

        if (req.body.publish) {
            post.status = 'activated';
        }
        if (req.body.draft) {
            post.status = 'draft';
        }

        post.save(function(err) {
            if (err) {
                req.flash('error', 'Could not add package');
                return res.redirect('/admin/post/add');
            } else {
                req.flash('success', 'Package has been added successfully');
                return res.redirect('/admin/post/edit/' + post._id);
            }
        });
    } else {
        Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
            res.render('post/add', {
                title: 'Write new post',
                categories: categories
            });
        });
    }
};

/**
 * Edit post
 */
exports.edit = function(req, res) {
    if ('post' == req.method.toLowerCase()) {

    } else {
        Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
            res.render('post/edit', {
                title: 'Write new post',
                categories: categories
            });
        });
    }
};

/**
 * Generate slug
 */
exports.slug = function(req, res) {
    var post = new Post({
        title: req.body.title
    });
    if (req.body.id) {
        post._id = req.body.id;
    }
    Post.generateSlug(post, function(slug) {
        res.json({
            slug: slug
        });
    });
};