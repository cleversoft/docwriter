var mongoose = require('mongoose'),
    Search = mongoose.model('search'),
    Setting  = mongoose.model('setting'),
    fs = require('fs');

exports.index = function(req, res) {
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

   Search.find().limit(10).sort({count:-1}).exec(function(err,data){
       res.render('dashboard/index', {
           title: 'Dashboard',
           listData : data,
           logo_content: logo_content,
           logo :  web_name
       });
    });
};