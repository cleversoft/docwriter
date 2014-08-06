exports.requireAuth = function(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.send(401, { error: 'Not authenticated' });
    }

    next();
};
