var env         = process.env.NODE_ENV || 'development',
    port        = process.env.PORT     || 3000,
    config      = require('./server/config/config')[env],
    express     = require('express'),
    compression = require('compression'),
    session     = require('express-session'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    mongoStore  = require('connect-mongo')(session),
    app         = express();

// Connect the database
mongoose.set('config', config);
mongoose.connect(config.db);

// Load models
var modelsPath = __dirname + '/server/models',
    fs         = require('fs');
fs.readdirSync(modelsPath).forEach(function(file) {
    if (~file.indexOf('.js')) {
        require(modelsPath + '/' + file);
    }
});

app.set('config', config);
app.set('views', config.root + '/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(bodyParser({ limit: '5mb' }));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(session({
    resave: false,              // Don't save session if unmodified
    saveUninitialized: false,   // Don't create session until something stored
    secret: config.session.secret,
    cookie: {
        domain: config.session.domain,
        //expires: new Date(Date.now() + config.session.lifetime),
        maxAge: config.session.lifetime
    },
    store: new mongoStore({
        url: config.db,
        collection : 'session'
    })
}));

app.locals.config   = config;
app.locals.gravatar = require('./server/helpers/gravatar');
app.locals.url      = require('./server/helpers/url');

// Routes
var controller = {
        admin: require('./server/controllers/admin'),
        category: require('./server/controllers/category'),
        file: require('./server/controllers/file'),
        index: require('./server/controllers/index'),
        pdf: require('./server/controllers/pdf'),
        post: require('./server/controllers/post'),
        user: require('./server/controllers/user')
    },
    middleware = {
        auth: require('./server/middlewares/auth')
    };

// Front-end
app.route('/').get(controller.index.index);

app.route('/category/:slug').get(controller.post.category);
app.route('/search').get(controller.post.search);
app.route('/post/feedback').all(controller.post.feedback);
app.route('/post/:slug').get(controller.post.view);

app.route('/pdf/download/:slug').get(controller.pdf.download);
app.route('/pdf/preview/:slug').get(controller.pdf.preview);
app.route('/pdf/footer').get(function(req, res) {
    res.render('pdf/footer');
});

// Back-end
app.route('/admin').get(controller.admin.index);

app.route('/category').post(middleware.auth.requireAuth,           controller.category.list);
app.route('/category/add').post(middleware.auth.requireAuth,       controller.category.add);
app.route('/category/get/:id').get(middleware.auth.requireAuth,    controller.category.get);
app.route('/category/order').post(middleware.auth.requireAuth,     controller.category.order);
app.route('/category/save/:id').post(middleware.auth.requireAuth,  controller.category.save);
app.route('/category/remove').post(middleware.auth.requireAuth,    controller.category.remove);
app.route('/category/slug').post(middleware.auth.requireAuth,      controller.category.slug);

app.route('/file/upload').post(middleware.auth.requireAuth,        controller.file.upload);

app.route('/pdf/export/:id').post(middleware.auth.requireAuth,     controller.pdf.export);

app.route('/post').post(middleware.auth.requireAuth,               controller.post.list);
app.route('/post/activate/:id').post(middleware.auth.requireAuth,  controller.post.activate);
app.route('/post/add').post(middleware.auth.requireAuth,           controller.post.add);
app.route('/post/duplicate/:id').post(middleware.auth.requireAuth, controller.post.duplicate);
app.route('/post/get/:id').get(middleware.auth.requireAuth,        controller.post.get);
app.route('/post/remove').post(middleware.auth.requireAuth,        controller.post.remove);
app.route('/post/save/:id').post(middleware.auth.requireAuth,      controller.post.save);
app.route('/post/slug').post(middleware.auth.requireAuth,          controller.post.slug);

app.route('/user').post(middleware.auth.requireAuth,               controller.user.list);
app.route('/user/add').post(middleware.auth.requireAuth,           controller.user.add);
app.route('/user/get/:id').get(middleware.auth.requireAuth,        controller.user.get);
app.route('/user/lock').post(middleware.auth.requireAuth,          controller.user.lock);
app.route('/user/me').post(middleware.auth.requireAuth,            controller.user.me);
app.route('/user/password').post(middleware.auth.requireAuth,      controller.user.password);
app.route('/user/save/:id').post(middleware.auth.requireAuth,      controller.user.save);
app.route('/user/signin').post(controller.user.signin);
app.route('/user/signout').post(middleware.auth.requireAuth,       controller.user.signout);

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

// Create socket IO
var http         = require('http'),
    server       = http.createServer(app),
    redis        = require('redis'),
    pub          = redis.createClient(),
    sub          = redis.createClient(null, null, { detect_buffers: true }),
    redisAdapter = require('socket.io-redis'),
    io           = require('socket.io')(server, {
        adapter: redisAdapter({
            key: config.redis.namespace + ':socket_io',
            pubClient: pub,
            subClient: sub
        })
    });

io.on('connection', function(socket) {
    socket.on('/job/exportPdf/starting', function(data) {
        console.log('emit ...', data);
        socket.broadcast.emit('/job/exportPdf/started', data);
    });
});

server.listen(port, function() {
    console.log('Starting app on port %d', port);
});