var env      = process.env.NODE_ENV || 'development',
    config   = require('./server/config/config')[env],
    redis    = require('redis'),
    Queue    = require(config.root + '/queue/queue'),
    mongoose = require('mongoose'),
    queue    = new Queue(config.redis.host, config.redis.port);

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

queue
    .setRootJobPath(config.root)
    .setNamespace(config.redis.namespace);
queue.process('exportPdf');