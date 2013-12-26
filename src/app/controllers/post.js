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

        post.prev_categories = null;
        post.save(function(err) {
            if (err) {
                req.flash('error', 'Could not add the post');
                return req.xhr ? res.json({ result: 'error' }) : res.redirect('/admin/post/add');
            } else {
                req.flash('success', 'The post has been added successfully');
                return req.xhr ? res.json({ result: 'ok' }) : res.redirect('/admin/post/edit/' + post._id);
            }
        });
    } else {
        var config = req.app.get('config');
        Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
            res.render('post/add', {
                title: 'Write new post',
                autoSave: config.autoSave || 0,
                categories: categories
            });
        });
    }
};

/**
 * Edit post
 */
exports.edit = function(req, res) {
    var id = req.param('id');
    Post.findOne({ _id: id }).exec(function(err, post) {
        if ('post' == req.method.toLowerCase()) {
            // Backup current categories
            post.prev_categories = post.categories;

            post.title           = req.body.title;
            post.slug            = req.body.slug;
            post.content         = req.body.content;
            post.categories      = req.body.categories || [];
            post.updated_date    = new Date();
            post.updated_user    = {
                username: req.session.user.username,
                full_name: req.session.user.full_name
            };

            if (req.body.publish) {
                post.status = 'activated';
            }
            if (req.body.draft) {
                post.status = 'draft';
            }

            post.save(function(err) {
                if (err) {
                    req.flash('error', 'Could not update the post');
                    return req.xhr ? res.json({ result: 'error' }) : res.redirect('/admin/post/edit/' + id);
                } else {
                    req.flash('success', 'The post has been added successfully');
                    return req.xhr ? res.json({ result: 'ok' }) : res.redirect('/admin/post/edit/' + id);
                }
            });
        } else {
            var config = req.app.get('config');
            Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
                res.render('post/edit', {
                    title: 'Write new post',
                    autoSave: config.autoSave || 0,
                    categories: categories,
                    post: post
                });
            });
        }
    });
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