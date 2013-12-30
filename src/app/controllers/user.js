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
 * Update an user
 */
exports.edit = function(req, res) {
    var id = req.param('id');
    if ('post' == req.method.toLowerCase()) {
        User.findOne({ _id: id }, function(err, user) {
            var isCurrentUser = (req.session.user.username == user.username);

            user.first_name = req.body.first_name;
            user.last_name  = req.body.last_name;
            //user.username   = req.body.username;
            user.email      = req.body.email;
            user.role       = req.body.role;

            if (req.body.password && req.body.confirm_password && req.body.password == req.body.confirm_password) {
                user.password = req.body.password;
            }

            var callback = function(success) {
                req.flash(success ? 'success' : 'error', success ? 'The user has been updated successfully' : 'Cannot update the user');

                // Update the session
                if (success && isCurrentUser) {
                    delete user.hashed_password;
                    delete user.salt;

                    req.session.user = user;
                }

                return res.redirect('/admin/user/edit/' + id);
            };
            User.isAvailable(user, 'username', function(isUsernameAvailable, foundUser) {
                if (isUsernameAvailable || (foundUser && foundUser._id == id)) {
                    User.isAvailable(user, 'email', function(isEmailAvailable, foundUser) {
                        if (isEmailAvailable || (foundUser && foundUser._id == id)) {
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
        });
    } else {
        User.findOne({ _id: id }, function(err, user) {
            res.render('user/edit', {
                title: 'Edit user',
                messages: {
                    warning: req.flash('error'),
                    success: req.flash('success')
                },
                user: user
            });
        });
    }
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