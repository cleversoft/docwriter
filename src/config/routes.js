var auth      = require('../app/controllers/auth'),
    category  = require('../app/controllers/category'),
    dashboard = require('../app/controllers/dashboard'),
    index     = require('../app/controllers/index'),
    post      = require('../app/controllers/post'),
    user      = require('../app/controllers/user');

var authentication     = require('./middlewares/authentication'),
    adminAuthorization = [authentication.requireAuthentication, authentication.user.hasAuthorization];

module.exports = function(app) {
    // --- Front-end routes ---
    app.get('/', index.index);

    // --- Back-end routes ---

    // Auth
    app.all('/admin/signin', auth.signin);
    app.get('/admin/signout', auth.signout);

    // Dashboard
    app.get('/admin', authentication.requireAuthentication, dashboard.index);

    // Categories
    app.get('/admin/category', authentication.requireAuthentication, category.index);

    // Posts
    app.get('/admin/post', authentication.requireAuthentication, post.index);
    app.all('/admin/post/add', authentication.requireAuthentication, post.add);

    // Users
    app.get('/admin/user', adminAuthorization, user.index);
};