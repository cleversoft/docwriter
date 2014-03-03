var mongoose = require('mongoose'),
    Category = mongoose.model('category'),
    Post     = mongoose.model('post'),
    moment   = require('moment'),
    Setting  = mongoose.model('setting'),
    fs = require('fs');

exports.index = function(req, res) {
    var config = req.app.get('config');
    if (fs.existsSync("./src/public/vendor/fileupload/img/logo.png")) {
        logo_content = "image";
    } else {
        logo_content = "text";
    }
    Setting.find().exec(function(err, setting){
        if ( setting.length == 1 ) {
            web_title = setting[0].web_title;
            web_name  = setting[0].web_name;
        } else {
            web_title =  config.app.name;
            web_name  = config.app.name;
        }
    });

    Category
        .find({})
        .sort({ position: 1 })
        .exec(function(err, categories) {
            Post
                .find({ status: 'activated' })
                .sort({ created_date: -1 })
                .limit(10)
                .exec(function(err, posts) {
                    res.render('partial/posts', {
                        title: web_title,
                        categories: categories,
                        category: null,
                        moment: moment,
                        numPages: 1,
                        posts: posts,
                        logo_content: logo_content,
                        logo :  web_name
                    });
                });
        });
};