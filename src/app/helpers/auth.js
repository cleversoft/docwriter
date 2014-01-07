module.exports = function(req) {
    return req.session && req.session.user;
};