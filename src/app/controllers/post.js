var marked   = require('marked'),
    moment   = require('moment'),
    mongoose = require('mongoose'),
    Category = mongoose.model('category'),
    Post     = mongoose.model('post');

/**
 * List posts in given category
 */
exports.category = function(req, res) {
    var slug = req.param('slug');
    Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
        Category.findOne({ slug: slug }).exec(function(err, category) {
            var perPage   = 10,
                pageRange = 5,
                page      = req.param('page') || 1,
                q         = req.param('q') || '',
                criteria  = q ? { title: new RegExp(q, 'i') } : {};

            criteria.status     = 'activated';
            criteria.categories = { $in: [category._id] };

            Post.count(criteria, function(err, total) {
                Post.find(criteria).sort({ created_date: -1 }).skip((page - 1) * perPage).limit(perPage).exec(function(err, posts) {
                    if (err) {
                        posts = [];
                    }

                    var numPages   = Math.ceil(total / perPage),
                        startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                        endRange   = startRange + pageRange;

                    if (endRange > numPages) {
                        endRange = numPages;
                    }

                    res.render('partial/posts', {
                        title: category.name,
                        categories: categories,
                        category: category,
                        req: req,
                        moment: moment,
                        total: total,
                        posts: posts,

                        // Criteria
                        q: q,
                        criteria: criteria,

                        // Pagination
                        page: page,
                        numPages: numPages,
                        startRange: startRange,
                        endRange: endRange
                    });
                });
            });
        });
    });
};

/**
 * Search for posts
 */
exports.search = function(req, res) {
    var slug = req.param('slug');
    Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
        var perPage   = 10,
            pageRange = 5,
            page      = req.param('page') || 1,
            q         = req.param('q') || '',
            criteria  = q ? { title: new RegExp(q, 'i') } : {};

        criteria.status = 'activated';

        Post.count(criteria, function(err, total) {
            Post.find(criteria).sort({ created_date: -1 }).skip((page - 1) * perPage).limit(perPage).exec(function(err, posts) {
                if (err) {
                    posts = [];
                }

                var numPages   = Math.ceil(total / perPage),
                    startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                    endRange   = startRange + pageRange;

                if (endRange > numPages) {
                    endRange = numPages;
                }

                res.render('partial/posts', {
                    title: 'Search for ' + q,
                    categories: categories,
                    req: req,
                    moment: moment,
                    total: total,
                    posts: posts,

                    // Criteria
                    q: q,
                    criteria: criteria,

                    // Pagination
                    page: page,
                    numPages: numPages,
                    startRange: startRange,
                    endRange: endRange
                });
            });
        });
    });
};

/**
 * View post details
 */
exports.view = function(req, res) {
    var slug = req.param('slug');
    Post.findOne({ slug: slug }).populate('categories').exec(function(err, post) {
        res.render('post/view', {
            title: post.title,
            marked: marked,
            moment: moment,
            post: post,
            signedIn: (req.session && req.session.user),
            siteUrl: req.protocol + '://' + req.get('host')
        });
    });
};

/**
 * List posts
 */
exports.index = function(req, res) {
    var perPage       = 10,
        pageRange     = 5,
        page          = req.param('page') || 1,
        status        = req.param('status'),
        q             = req.param('q') || '',
        sortBy        = req.param('sort') || '-created_date',
        criteria      = q ? { title: new RegExp(q, 'i') } : {},
        sortCriteria  = {},
        sortDirection = ('-' == sortBy.substr(0, 1)) ? -1 : 1;

    sortBy = '-' == sortBy.substr(0, 1) ? sortBy.substr(1) : sortBy;
    sortCriteria[sortBy] = sortDirection;

    if (status) {
        criteria.status = status;
    }

    Post.count(criteria, function(err, total) {
        Post.find(criteria).sort(sortCriteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, posts) {
            if (err) {
                posts = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor((page - 1) / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('post/index', {
                title: 'Posts',
                req: req,
                moment: moment,
                total: total,
                posts: posts,

                // Criteria
                q: q,
                criteria: criteria,
                sortBy: sortBy,
                sortDirection: sortDirection,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};

/**
 * Activate/deactivate post
 */
exports.activate = function(req, res) {
    var id = req.body.id;
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err || !post) {
                return res.json({ result: 'error'});
            }
            post.status = (post.status == 'activated') ? 'deactivated' : 'activated';
            post.save(function(err) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
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
            if (req.xhr) {
                return res.json({ result: err ? 'error' : 'ok' });
            } else {
                req.flash(err ? 'error'                  : 'success',
                          err ? 'Could not add the post' : 'The post has been added successfully');
                return res.redirect(err ? '/admin/post/add' : '/admin/post/edit/' + post._id);
            }
        });
    } else {
        var config = req.app.get('config');
        Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
            res.render('post/add', {
                title: 'Write new post',
                autoSave: config.autoSave || 0,
                categories: categories,
                messages: {
                    warning: req.flash('error'),
                    success: req.flash('success')
                }
            });
        });
    }
};

/**
 * Edit post
 */
exports.edit = function(req, res) {
    var id     = req.param('id'),
        config = req.app.get('config');
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
                // TODO: Export to PDF as background job

                if (req.xhr) {
                    return res.json({ result: err ? 'error' : 'ok' });
                }
                req.flash(err ? 'error'                     : 'success',
                          err ? 'Could not update the post' : 'The post has been updated successfully');
                return res.redirect('/admin/post/edit/' + id);
            });
        } else {
            Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
                res.render('post/edit', {
                    title: 'Edit post',
                    autoSave: config.autoSave || 0,
                    categories: categories,
                    messages: {
                        warning: req.flash('error'),
                        success: req.flash('success')
                    },
                    post: post
                });
            });
        }
    });
};

/**
 * Remove post
 */
exports.remove = function(req, res) {
    var id = req.body.id;
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err || !post) {
                return res.json({ result: 'error'});
            }
            post.remove(function(err) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
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
        res.json({ slug: slug });
    });
};