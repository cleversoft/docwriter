var env      = process.env.NODE_ENV || 'development',
    config   = require('../config/config')[env],
    redis    = require('redis'),
    mongoose = require('mongoose');

// Connect the database
mongoose.set('config', config);
mongoose.connect(config.db);

// Load models
var modelsPath = config.root + '/models',
    fs         = require('fs');
fs.readdirSync(modelsPath).forEach(function(file) {
    if (~file.indexOf('.js')) {
        require(modelsPath + '/' + file);
    }
});

// Update post
var Post = mongoose.model('post'),
    User = mongoose.model('user');

User.find().exec(function(err, users) {
    for (var i = 0; i < users.length; i++) {
        Post.update({
            'created.username': users[i].username
        }, {
            'created.user_id': users[i]._id,
            'created.username': users[i].username,
            'created.email': users[i].email
        }, {
            multi: true
        });

        Post.update({
            'updated.username': users[i].username
        }, {
            'updated.user_id': users[i]._id,
            'updated.username': users[i].username,
            'updated.email': users[i].email
        }, {
            multi: true
        });
    }
});
