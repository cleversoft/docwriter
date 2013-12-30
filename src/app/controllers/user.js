var mongoose = require('mongoose'),
    User     = mongoose.model('user');

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