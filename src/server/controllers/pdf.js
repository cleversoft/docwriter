var fs       = require('fs'),
    marked   = require('marked'),
    moment   = require('moment'),
    mongoose = require('mongoose'),
    Post     = mongoose.model('post');

/**
 * Export to PDF
 */
exports.export = function(req, res) {
    var id     = req.param('id'),
        config = req.app.get('config');
    Post
        .findOne({ _id: id })
        .exec(function(err, post) {
            if (err) {
                return res.json({ msg: err });
            }
            if (!post) {
                return res.json({ msg: 'The post is not found' });
            }
            if (post.status !== 'activated') {
                return res.json({ msg: 'The post has not published yet' });
            }

            post.pdf = {
                status: 'done',
                user_id: req.session.user._id,
                username: req.session.user.username,
                email: req.session.user.email,
                date: new Date()
            };
            post.save(function(err) {
                return res.json({ msg: err || 'ok' });
            });
        });
};

/**
 * Preview post
 * It's used by exporting to PDF job
 */
exports.preview = function(req, res) {
    var slug   = req.param('slug'),
        config = req.app.get('config');
    Post.findOne({ slug: slug }).exec(function(err, post) {
        res.render('pdf/preview', {
            title: post.title,
            appName: config.app.name,
            appUrl: config.app.url || req.protocol + '://' + req.get('host'),
            marked: marked,
            moment: moment,
            post: post,
            year: new Date().getFullYear()
        });
    });
};