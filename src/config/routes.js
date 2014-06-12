var auth      = require('../app/controllers/auth'),
    category  = require('../app/controllers/category'),
    dashboard = require('../app/controllers/dashboard'),
    file      = require('../app/controllers/file'),
    index     = require('../app/controllers/index'),
    post      = require('../app/controllers/post'),
    user      = require('../app/controllers/user');

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

    // Auth
    app.all('/signin',              auth.signin);
    app.get('/signout',             auth.signout);
    app.all('/forgot-password',     auth.forgotPassword);
    app.all('/reset-password/:reset_hash',  auth.resetPassword);
    app.all('/reset-password',      auth.resetPassword);
    app.all('/admin/password', authentication.requireAuthentication, auth.changePassword);

    // Dashboard
    app.get('/admin',          authentication.requireAuthentication, dashboard.index);

    // Categories
    app.get('/admin/category',         authentication.requireAuthentication, category.index);
    app.post('/admin/category/add',    authentication.requireAuthentication, category.add);
    app.post('/admin/category/edit',   authentication.requireAuthentication, category.edit);
    app.post('/admin/category/order',  authentication.requireAuthentication, category.order);
    app.post('/admin/category/remove', authentication.requireAuthentication, category.remove);
    app.post('/admin/category/slug',   authentication.requireAuthentication, category.slug);

    // File
    app.post('/admin/file/upload', authentication.requireAuthentication, file.upload);

    // Posts
    app.get('/admin/post',          authentication.requireAuthentication, post.index);
    app.all('/admin/post/activate', authentication.requireAuthentication, post.activate);
    app.all('/admin/post/add',      authentication.requireAuthentication, post.add);
    app.all('/admin/post/edit/:id', authentication.requireAuthentication, post.edit);
    app.post('/admin/post/remove',  authentication.requireAuthentication, post.remove);
    app.post('/admin/post/slug',    authentication.requireAuthentication, post.slug);
    app.all('/admin/post/duplicate/:id',    authentication.requireAuthentication, post.duplicate);

    // Users
    app.get('/admin/user',               adminAuthorization, user.index);
    app.all('/admin/user/add',           adminAuthorization, user.add);
    app.post('/admin/user/check/:field', adminAuthorization, user.check);
    app.all('/admin/user/edit/:id',      adminAuthorization, user.edit);
    app.post('/admin/user/lock',         adminAuthorization, user.lock);
};