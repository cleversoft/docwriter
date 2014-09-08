var fs       = require('fs'),
    marked   = require('marked'),
    moment   = require('moment'),
    mongoose = require('mongoose'),
    Post     = mongoose.model('post');

/**
 * Download PDF
 */
exports.download = function(req, res) {
    var slug   = req.param('slug'),
        config = req.app.get('config');
    Post.findOne({ slug: slug }).exec(function(err, post) {
        if (err || !post || post.status != 'activated') {
            return res.send('The guide is not found or has not been published yet', 404);
        }

        var pdfFile = config.jobs.exportPdf.dir + '/' + post.slug + '.pdf';
        if (!fs.existsSync(pdfFile)) {
            return res.send('The PDF is not available at the moment', 403);
        }

        post.prev_categories = post.categories;
        post.pdf_downloads++;
        post.save(function() {
            res.setHeader('Content-Description', 'Download file');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename=' + post.slug + '.pdf');

            var stream = fs.createReadStream(pdfFile);
            stream.pipe(res);
        });
    });
};

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

            // Export to PDF as background job
            var Queue = require(config.root + '/queue/queue'),
                queue = new Queue(config.redis.host, config.redis.port);

            queue.setNamespace(config.redis.namespace);
            queue.enqueue('exportPdf', '/jobs/exportPdf', {
                post_id: post._id,
                url: config.app.url + '/pdf/preview/' + post.slug,
                footer: config.app.url + '/pdf/footer',
                file: config.jobs.exportPdf.dir + '/' + post.slug + '.pdf',
                user_id: post.pdf.user_id,
                username: post.pdf.username,
                email: post.pdf.email,
                date: post.pdf.date
            });

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
        if (err || !post || post.status !== 'activated') {
            return res.send(404);
        }

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