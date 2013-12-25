var mongoose = require('mongoose'),
    User     = mongoose.model('user');

/**
 * Sign in
 */
exports.signin = function(req, res) {
    // Redirect to the admin page if user has logged in
    if (req.session.user) {
        return res.redirect('/admin');
    }

    if ('post' == req.method.toLowerCase()) {
        User.findOne({ username: req.body.user_name }, function(err, user) {
            if (err || !user) {
                req.flash('error', 'Not found administrator account');
                return res.redirect('/admin/signin');
            }
            if (user.locked) {
                req.flash('error', 'The administrator is locked');
                return res.redirect('/admin/signin');
            }
            if (!user.verifyPassword(req.body.password)) {
                req.flash('error', 'Wrong password');
                return res.redirect('/admin/signin');
            }

            req.session.user = {
                username: user.username,
                role: user.role
            };

            if (req.session.returnTo) {
                var to = req.session.returnTo;
                delete req.session.returnTo;
                return res.redirect(to);
            }
            return res.redirect('/admin');
        });
    } else {
        res.render('auth/signin', {
            title: 'Sign in',
            messages: {
                warning: req.flash('error'),
                success: req.flash('success')
            }
        });
    }
};

exports.signout = function(req, res) {

};