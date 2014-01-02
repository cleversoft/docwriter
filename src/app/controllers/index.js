var mongoose = require('mongoose'),
    Category = mongoose.model('category'),
    Post     = mongoose.model('post'),
    moment   = require('moment');

exports.index = function(req, res) {
    var config = req.app.get('config');
    Category.find({}).sort({ position: 1 }).exec(function(err, categories) {
        Post.find().sort({ created_date: -1 }).limit(10).exec(function(err, posts) {
            res.render('partial/posts', {
                title: config.app.name,
                categories: categories,
                category: null,
                moment: moment,
                numPages: 1,
                posts: posts
            });
        });
    });
};