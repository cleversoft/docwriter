var express    = require('express'),
    flash      = require('connect-flash'),
    mongoStore = require('connect-mongo')(express);

module.exports = function(app, config) {
    app.set('config', config);
    app.set('showStackError', true);

    // Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }));

    app.use(express.static(config.root + '/public'));

    // Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }

    // Set the views path, template engine, and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    app.configure(function() {
        // cookieParser should be above session
        app.use(express.cookieParser());

        app.use(express.limit(config.upload.maxSize / 1024 + 'mb'));

        // bodyParser should be above methodOverride
        // Disable bodyParser() for file upload
        app.use(express.json())
           .use(express.urlencoded());

        app.use(express.methodOverride());

        app.use(express.session({
            secret: config.session.secret,
            cookie: {
                domain: config.session.domain,
                maxAge: config.session.lifetime
            },
            store: new mongoStore({
                url: config.db,
                collection : 'session'
            })
        }));

        // Connect flash for flash messages
        // Should be declared after sessions
        app.use(flash());

        app.use(app.router);

        // Handle 404 error
        app.use(function(req, res, next) {
            res.status(404);

            // Respond with html page
            if (req.accepts('html')) {
                res.render('404', {
                    title: 'Not found',
                    url: req.url
                });
                return;
            }

            // Respond with json
            if (req.accepts('json')) {
                res.send({ error: 'Not found' });
                return;
            }

            // default to plain-text. send()
            res.type('txt').send('Not found');
        });

        // Handle 500 error
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('500', {
                title: 'Error',
                error: err
            });
        });
    });

    app.configure('development', function() {
        app.use(express.errorHandler({
            dumpExceptions: true,
            howStack: true
        }));
    });
};