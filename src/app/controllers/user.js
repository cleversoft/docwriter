var mongoose = require('mongoose'),
    User     = mongoose.model('user');

/**
 * Add new user
 */
exports.add = function(req, res) {
    if ('post' == req.method.toLowerCase()) {
        var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        });
        var callback = function(success) {
            req.flash(success ? 'success' : 'error', success ? 'The user has been added successfully' : 'Cannot add new user');
            return res.redirect('/admin/user/add');
        };
        User.isAvailable(user, 'username', function(isUsernameAvailable) {
            if (isUsernameAvailable) {
                User.isAvailable(user, 'email', function(isEmailAvailable) {
                    if (isEmailAvailable) {
                        user.save(function(err) {
                            callback(!err);
                        });
                    } else {
                        callback(false);
                    }
                });
            } else {
                callback(false);
            }
        });
    } else {
        res.render('user/add', {
            title: 'Add new user',
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            }
        });
    }
};

/**
 * Check if an username/email address has been taken
 */
exports.check = function(req, res) {
    var field = req.param('field'),
        id    = req.body.id,
        value = req.body[field],
        user  = new User();
    user[field] = value;
    User.isAvailable(user, field, function(isAvailable, foundUser) {
        res.json({
            valid: isAvailable || (id && foundUser && foundUser._id == id)
        });
    });
};

/**
 * Lock/unlock user
 */
exports.lock = function(req, res) {
    var id = req.body.id;
    User.findOne({ _id: id }, function(err, user) {
        if (req.session.user.username == user.username) {
            return res.json({ success: false });
        }

        user.locked = !user.locked;
        user.save(function(err) {
            return res.json({ success: !err });
        });
    });
};

/**
 * List users
 */
exports.index = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        criteria  = q ? { username: new RegExp(q, 'i') } : {};

    User.count(criteria, function(err, total) {
        User.find(criteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, users) {
            if (err) {
                users = [];
            }

            var numPages   = Math.ceil(total / perPage),
                startRange = (page == 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            res.render('user/index', {
                title: 'Users',
                req: req,
                total: total,
                users: users,

                // Criteria
                q: q,
                currentUser: req.session.user.username,

                // Pagination
                page: page,
                numPages: numPages,
                startRange: startRange,
                endRange: endRange
            });
        });
    });
};