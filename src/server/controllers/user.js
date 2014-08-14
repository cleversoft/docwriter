var mongoose = require('mongoose'),
    User     = mongoose.model('user');

/**
 * Sign in
 */
exports.signin = function(req, res) {
    var username = req.body.username || '',
        password = req.body.password || '';

    if (username === '' || password === '') {
        return res.send(401);
    }

    User.findOne({ username: username }, function(err, user) {
        if (err || !user) {
            return res.send(401, { msg: 'User not found' });
        }
        if (user.locked) {
            return res.send(401, { msg: 'The user is locked' });
        }
        if (!user.verifyPassword(password)) {
            return res.send(401, { msg: 'Invalid username or password' });
        }

        req.session.user = user;
        return res.json({
            msg: 'ok',
            user: {
                username: user.username
            }
        });
    });
};

/**
 * Sign out
 */
exports.signout = function(req, res) {
    if (req.session.user) {
        delete req.session.user;
    }

    res.json({ msg: 'ok' });
};

/**
 * Get user of current session
 */
exports.me = function(req, res) {
    return res.json({
        msg: 'ok',
        user: {
            username: req.session.user.username,
            email: req.session.user.email
        }
    });
};

/**
 * Change the password
 */
exports.password = function(req, res) {
    var userName    = req.session.user.username,
        password    = req.body.password,
        newPassword = req.body.new_password;

    User.findOne({ username: userName }, function(err, user) {
        if (err) {
            return res.json({ msg: err });
        }
        if (!user) {
            return res.json({ msg: 'User is not found' });
        }

        // Verify current password
        if (!user.verifyPassword(password)) {
            return res.json({ msg: 'The current password is wrong' });
        }

        // Update the password
        user.password = newPassword;
        user.save(function(err) {
            return res.json({ msg: err || 'ok' });
        });
    });
};

/**
 * List administrators
 */
exports.list = function(req, res) {
    var perPage   = 10,
        pageRange = 5,
        page      = req.param('page') || 1,
        q         = req.param('q') || '',
        criteria  = q ? { username: new RegExp(q, 'i') } : {};

    User.count(criteria, function(err, total) {
        User.find(criteria).skip((page - 1) * perPage).limit(perPage).exec(function(err, rows) {
            var numPages   = Math.ceil(total / perPage),
                startRange = (page === 1) ? 1 : pageRange * Math.floor(page / pageRange) + 1,
                endRange   = startRange + pageRange;

            if (endRange > numPages) {
                endRange = numPages;
            }

            rows = err ? [] : rows;
            var users = [];
            for (var i = 0; i < rows.length; i++) {
                users.push({
                    _id: rows[i]._id,
                    email: rows[i].email,
                    first_name: rows[i].first_name,
                    last_name: rows[i].last_name,
                    locked: rows[i].locked,
                    role: rows[i].role,
                    username: rows[i].username
                });
            }

            res.json({
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
 * Lock/unlock administrator
 */
exports.lock = function(req, res) {
    var id = req.body.id;
    User.findOne({ _id: id }, function(err, user) {
        if (err) {
            return res.json({ msg: err });
        }
        if (!user) {
            return res.json({ msg: 'User is not found' });
        }

        if (req.session.user.username === user.username) {
            return res.json({ msg: 'Cannot lock yourself' });
        }

        user.locked = !user.locked;
        user.save(function(err) {
            return res.json({ msg: err || 'ok' });
        });
    });
};

/**
 * Get user details
 */
exports.get = function(req, res) {
    var id = req.param('id');
    User.findOne({ _id: id }, function(err, user) {
        if (err) {
            return res.json({ msg: err });
        }
        if (!user) {
            return res.json({ msg: 'User is not found' });
        }

        return res.json({
            msg: 'ok',
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                locked: user.locked,
                role: user.role,
                username: user.username
            }
        });
    });
};

/**
 * Add new administrator
 */
exports.add = function(req, res) {
    var user = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role
        }),
        required = {
            username: 'The username is required',
            email: 'The email address is required',
            password: 'The password is required',
            role: 'The role is required'
        };
    for (var key in required) {
        if (!user[key]) {
            return res.json({ msg: required[key] });
        }
    }

    User
        .findOne({ username: user.username })
        .exec()
        .then(function(found) {
            if (found) {
                return res.json({ msg: 'The username is not available' });
            }
            return User.findOne({ email: user.email }).exec();
        }, function(err) {
            return res.json({ msg: err });
        })
        .then(function(found) {
            if (found) {
                return res.json({ msg: 'The email address is not available' });
            }
            user.save(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        }, function(err) {
            return res.json({ msg: err });
        });
};

/**
 * Save administrator
 */
exports.save = function(req, res) {
    var id = req.param('id');
    User.findOne({ _id: id }, function(err, user) {
        var isCurrentUser = (req.session.user.username === user.username);

        user.first_name = req.body.first_name;
        user.last_name  = req.body.last_name;
        user.username   = req.body.username;
        user.email      = req.body.email;
        user.role       = req.body.role;
        user.password   = req.body.password;

        User
            .findOne({ username: user.username })
            .exec()
            .then(function(found) {
                if (found && found._id.toString() !== id) {
                    return res.json({ msg: 'The username is not available' });
                }
                return User.findOne({ email: user.email }).exec();
            }, function(err) {
                return res.json({ msg: err });
            })
            .then(function(found) {
                if (found && found._id.toString() !== id) {
                    return res.json({ msg: 'The email address is not available' });
                }
                user.save(function(err) {
                    if (!err && isCurrentUser) {
                        // Update the session
                        req.session.user = {
                            username: user.username,
                            role: user.role
                        };
                    }

                    return res.json({ msg: err || 'ok' });
                });
            }, function(err) {
                return res.json({ msg: err });
            });
    });
};
