var env        = process.env.NODE_ENV || 'development',
    port       = process.env.PORT     || 3000,
    config     = require('./server/config/config')[env],
    express    = require('express'),
    session    = require('express-session'),
    bodyParser = require('body-parser'),
    mongoose   = require('mongoose'),
    mongoStore = require('connect-mongo')(session),
    app        = module.exports = express();

// Connect the database
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

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
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

// Routes
var controller = {
        admin: require('./server/controllers/admin'),
        category: require('./server/controllers/category'),
        user: require('./server/controllers/user')
    },
    middleware = {
        auth: require('./server/middlewares/auth')
    };

app.route('/admin').get(controller.admin.index);

app.route('/category').post(middleware.auth.requireAuth, controller.category.list);
app.route('/category/add').post(middleware.auth.requireAuth, controller.category.add);
app.route('/category/slug').post(middleware.auth.requireAuth, controller.category.slug);

app.route('/user').post(middleware.auth.requireAuth, controller.user.list);
app.route('/user/add').post(middleware.auth.requireAuth, controller.user.add);
app.route('/user/get/:id').get(middleware.auth.requireAuth, controller.user.get);
app.route('/user/lock').post(middleware.auth.requireAuth, controller.user.lock);
app.route('/user/me').post(middleware.auth.requireAuth, controller.user.me);
app.route('/user/password').post(middleware.auth.requireAuth, controller.user.password);
app.route('/user/save/:id').post(middleware.auth.requireAuth, controller.user.save);
app.route('/user/signin').post(controller.user.signin);
app.route('/user/signout').post(middleware.auth.requireAuth, controller.user.signout);

app.listen(port);
console.log('Start on port ' + port);
