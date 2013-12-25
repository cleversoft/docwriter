var auth       = require('../app/controllers/auth'),
    dashboard  = require('../app/controllers/dashboard'),
    index      = require('../app/controllers/index');

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
};