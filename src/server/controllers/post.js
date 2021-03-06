var fs       = require('fs'),
    marked   = require('marked'),
    moment   = require('moment'),
    mongoose = require('mongoose'),
    Category = mongoose.model('category'),
    Post     = mongoose.model('post');

// --- FRONT-END ---

/**
 * List posts in given category
 */
exports.category = function(req, res) {
    var slug   = req.param('slug'),
        config = req.app.get('config');
    Category
        .find({})
        .sort({ position: 1 })
        .exec(function(err, categories) {
            Category
                .findOne({ slug: slug })
                .exec(function(err, category) {
                    if (err || !category) {
                        return res.send('The category is not found', 404);
                    }

                    var perPage   = 10,
                        pageRange = 5,
                        page      = req.param('page') || 1,
                        q         = req.param('q') || '',
                        criteria  = q ? { title: new RegExp(q, 'i') } : {};

                    criteria.status     = 'activated';
                    criteria.categories = { $in: [category._id] };

                    Post.count(criteria, function(err, total) {
                        Post
                            .find(criteria)
                            .sort({ 'updated.date': -1 })
                            .skip((page - 1) * perPage)
                            .limit(perPage)
                            .exec(function(err, posts) {
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
                                    appUrl: config.app.url || req.protocol + '://' + req.get('host'),
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

exports.feedback = function (req, res) {
    var id     = req.body.id,
        action = req.body.action;

    if (req.session && req.session.feedback && req.session.feedback[id]) {
        if (req.session.feedback[id] == action) {
            // user already has had feedback for this post
            return res.json({ result: 'error'});
        }
        else {
            // if user had feedback, but now change to like/dislike
            req.session.feedback = {  };
            req.session.feedback[id] = action;

            var newData = action == 'like' ?
                {$inc: { like: 1, dislike: -1 }} :
                {$inc: { like: -1, dislike: 1 }};

            Post.findByIdAndUpdate(id, newData, function (err, post) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
        }
    } else {
        // user does not have feedback for this post
        if (!req.session.feedback) req.session.feedback = { };
        req.session.feedback[id] = action;

        if (id) {
            // update new data
            Post.findByIdAndUpdate(id, { $inc: (action == 'like' ? { like: 1 } : { dislike: 1 }) }, function (err, post) {
                return res.json({ result: err ? 'error' : 'ok' });
            });
        } else {
            // no id was found
            return res.json({ result: 'error' });
        }
    }
};

/**
 * Search for posts
 */
exports.search = function(req, res) {
    var slug   = req.param('slug'),
        config = req.app.get('config');
    Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
        var perPage   = 10,
            pageRange = 5,
            page      = req.param('page') || 1,
            q         = req.param('q') || '',
            criteria  = q ? { title: new RegExp(q, 'i') } : {};

        criteria.status = 'activated';

        Post.count(criteria, function(err, total) {
            Post
                .find(criteria)
                .sort({ 'updated.date': -1 })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(function(err, posts) {
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
                        appUrl: config.app.url || req.protocol + '://' + req.get('host'),
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
    var slug   = req.param('slug'),
        config = req.app.get('config');
    Post.findOne({ slug: slug }).populate('categories').exec(function(err, post) {
        if (err || !post || post.status != 'activated') {
            return res.send('The guide is not found or has not been published yet', 404);
        }

        var pdfAvailable = fs.existsSync(config.jobs.exportPdf.dir + '/' + post.slug + '.pdf');

        // calculate percent for the feedback bar
        var likePercent = post.dislike != 0 ? ((post.like / (post.dislike + post.like)) * 100) : 100;
        var dislikePercent = 100 - likePercent;

        res.render('post/view', {
            title: post.title,
            appUrl: config.app.url || req.protocol + '://' + req.get('host'),
            marked: marked,
            moment: moment,
            pdfAvailable: pdfAvailable,
            post: post,
            comment: config.comment,
            signedIn: (req.session && req.session.user),
            userFeedback: ((req.session && req.session.feedback && req.session.feedback[post._id]) ? req.session.feedback[post._id] : ''),
            likePercent: likePercent,
            dislikePercent: dislikePercent
        });
    });
};

// --- BACK-END ---

/**
 * Activate/deactivate post
 */
exports.activate = function(req, res) {
    var id     = req.param('id'),
        config = req.app.get('config');
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err || !post) {
                return res.json({ msg: 'error' });
            }

            post.status          = (post.status === 'activated') ? 'deactivated' : 'activated';
            post.prev_categories = post.categories;
            if (post.status === 'activated') {
                post.pdf = {
                    user_id: req.session.user._id,
                    username: req.session.user.username,
                    email: req.session.user.email,
                    date: new Date()
                };
            }
            post.save(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

/**
 * Add new post
 */
exports.add = function(req, res) {
    var config = req.app.get('config');
    var post = new Post({
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        created: {
            user_id: req.session.user._id,
            username: req.session.user.username,
            email: req.session.user.email,
            date: new Date()
        },
        updated: {
            user_id: req.session.user._id,
            username: req.session.user.username,
            email: req.session.user.email,
            date: new Date()
        },
        categories: req.body.categories || [],
        pdf: {
            user_id: req.session.user._id,
            username: req.session.user.username,
            email: req.session.user.email,
            date: new Date()
        }
    });

    post.heading_styles = req.body.heading_styles === 'custom'
                        ? [req.body.heading_style_h1 || '_', req.body.heading_style_h2 || '_', req.body.heading_style_h3 || '_', req.body.heading_style_h4 || '_', req.body.heading_style_h5 || '_', req.body.heading_style_h6 || '_'].join('')
                        : req.body.heading_styles;

    if (req.body.status) {
        post.status = req.body.status;
    }

    post.prev_categories = null;
    post.save(function(err) {
        return res.json({
            msg: err || 'ok',
            id: err ? null : post._id
        });
    });
};

/**
 * Duplicate post
 */
exports.duplicate = function(req, res) {
    var id = req.param('id');
    Post
        .findOne({_id: id})
        .exec(function(err, post) {
            if (err || !post) {
                return res.json({ msg: 'error' });
            }

            var duplicatePost = new Post({
                title: post.title + ' copy',
                content: post.content,
                status: post.status,
                created: {
                    user_id: req.session.user._id,
                    username: req.session.user.username,
                    email: req.session.user.email,
                    date: new Date()
                },
                updated: {
                    user_id: req.session.user._id,
                    username: req.session.user.username,
                    email: req.session.user.email,
                    date: new Date()
                },
                categories: post.categories,
                heading_styles: post.heading_styles,
                pdf: {
                    user_id: req.session.user._id,
                    username: req.session.user.username,
                    email: req.session.user.email,
                    date: new Date()
                }
            });

            // Generate new Slug
            Post.generateSlug(duplicatePost, function(slug) {
                duplicatePost.slug = slug;

                duplicatePost.save(function(err) {
                    return res.json({
                        msg: err || 'ok',
                        post: duplicatePost
                    });
                });
            });
        });
};

/**
 * Get post details
 */
exports.get = function(req, res) {
    var id = req.param('id');
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err) {
                return res.json({ msg: err });
            }
            if (!post) {
                return res.json({ msg: 'The post is not found' });
            }
            return res.json({ msg: 'ok', post: post });
        });
};

/**
 * Push post to trash
 */
exports.pushToTrash = function(req, res) {
    var id = req.param('id');
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err || !post) {
                return res.json({ msg: 'error' });
            }

            post.status = 'trash';
            post.save(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

/**
 * List posts
 */
exports.list = function(req, res) {
    var perPage       = 20,
        page          = req.body.page    || 1,
        status        = req.body.status,
        q             = req.body.keyword || '',
        sortBy        = req.body.sort    || '-created.date',
        criteria      = q ? { title: new RegExp(q, 'i') } : {},
        sortCriteria  = {},
        sortDirection = ('-' == sortBy.substr(0, 1)) ? -1 : 1;

    sortBy = '-' == sortBy.substr(0, 1) ? sortBy.substr(1) : sortBy;
    sortCriteria[sortBy] = sortDirection;

    if (status) {
        criteria.status = status;
    }

    Post.count(criteria, function(err, total) {
        Post
            .find(criteria)
            .sort(sortCriteria)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec(function(err, posts) {
                if (err) {
                    posts = [];
                }

                var numPages = Math.ceil(total / perPage);
                res.json({
                    posts: posts,
                    pagination: {
                        total_items: total,
                        per_page: perPage,
                        current_page: page,
                        num_pages: numPages
                    }
                });
            });
    });
};

/**
 * Remove post
 */
exports.remove = function(req, res) {
    var id = req.param('id');
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err) {
                return res.json({ msg: err });
            }
            if (!post) {
                return res.json({ msg: 'The post is not found' });
            }
            post.remove(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

/**
 * Save the post
 */
exports.save = function(req, res) {
    var id     = req.param('id'),
        config = req.app.get('config');
    Post.findOne({ _id: id }).exec(function(err, post) {
        if (err) {
            return res.json({ msg: err });
        }
        if (!post) {
            return res.json({ msg: 'The post is not found' });
        }

        // Backup current categories
        post.prev_categories = post.categories;

        post.title           = req.body.title;
        post.slug            = req.body.slug;
        post.content         = req.body.content;
        post.categories      = req.body.categories || [];
        post.updated         = {
            user_id: req.session.user._id,
            username: req.session.user.username,
            email: req.session.user.email,
            date: new Date()
        };
        post.pdf             = {
            user_id: req.session.user._id,
            username: req.session.user.username,
            email: req.session.user.email,
            date: new Date()
        };

        post.heading_styles  = req.body.heading_styles === 'custom'
                             ? [req.body.heading_style_h1 || '_', req.body.heading_style_h2 || '_', req.body.heading_style_h3 || '_', req.body.heading_style_h4 || '_', req.body.heading_style_h5 || '_', req.body.heading_style_h6 || '_'].join('')
                             : req.body.heading_styles;

        if (req.body.status) {
            post.status = req.body.status;
        }

        post.save(function(err) {
            return res.json({ msg: err || 'ok' });
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
