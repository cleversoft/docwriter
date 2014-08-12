var dashboard = require('../app/controllers/dashboard'),
    file      = require('../app/controllers/file'),
    index     = require('../app/controllers/index'),
    post      = require('../app/controllers/post');

var authentication     = require('./middlewares/authentication'),
    adminAuthorization = [authentication.requireAuthentication, authentication.user.hasAuthorization];

module.exports = function(app) {
    app.get('/*', function (req, res, next) {
        res.config = req.app.get('config');
        next();
    });

    // --- Front-end routes ---
    app.get('/', index.index);
    app.get('/category/:slug',     post.category);
    app.get('/post/pdf/:slug',     post.download);
    app.get('/post/preview/:slug', post.preview);
    app.get('/search',             post.search);
    app.all('/post/feedback',      post.feedback);
    app.get('/post/:slug',         post.view);

    // --- Back-end routes ---

    // Posts
    app.all('/admin/post/activate', authentication.requireAuthentication, post.activate);
    app.all('/admin/post/duplicate/:id',    authentication.requireAuthentication, post.duplicate);
};