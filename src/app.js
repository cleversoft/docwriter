var
    // Environment
    env     = process.env.NODE_ENV || 'development',

    express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server, { log: env == 'development' }),

    // Load configuration
    config  = require('./config/config')[env],

    redis       = require('redis'),
    redisClient = redis.createClient(config.redis.port || 6379, config.redis.host || '127.0.0.1');

// Connect DB
var mongoose = require('mongoose');
mongoose.connect(config.db);

// Load models
var modelsPath = __dirname + '/app/models',
    fs         = require('fs');
fs.readdirSync(modelsPath).forEach(function(file) {
    if (~file.indexOf('.js')) {
        require(modelsPath + '/' + file);
    }
});

// Express settings
require('./config/express')(app, config);

// Load routes
require('./config/routes')(app);

// View helpers
app.locals({
    config: config,
    url: require('./app/helpers/url')
});

var socketConnections = {};
io.sockets.on('connection', function(socket) {
    socket.on('userName', function(userName) {
        if (userName) {
            socketConnections[userName] = socket;
            app.set('socketConnections', socketConnections);
        }
    });

//    redisClient.subscribe('jobs');
//    redisClient.on('message', function(channel, message) {
//        console.log(channel);
//        console.log(message);
//    });
});

// Listening
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Start on port ' + port);

module.exports = app;