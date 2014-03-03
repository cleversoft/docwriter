var mongoose    = require('mongoose'),
    Setting     = mongoose.model('setting'),
    fs          = require('fs');

exports.index = function(req, res){
    var config = req.app.get('config');
    if ('post' == req.method.toLowerCase()) {
        // get the temporary location of the file
        var tmp_path = req.files.image.path;
        // set where the file should actually exists - in this case it is in the "images" directory
        var target_path = './src/public/vendor/fileupload/img/logo.png';
        var action = req.body.action;
        // logo is Website name
        if (action == 'Website name') {
            fs.rename(tmp_path, target_path, function(err) {
                if (err) throw err;
                // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                fs.unlink(tmp_path, function() {
                    if (err) throw err;
                });
                fs.unlink(target_path, function() {
                    if (err) throw err;
                });
            });
            // Add website name , website title
            Setting.find().exec(function(err, setting){
                if ( setting.length == 1 ) {
                    Setting.update({web_title: req.body.website_title, web_name: req.body.website_name},function(err,list){
                        if(err){
                            return handleError(err);
                        } else {
                            res.render('setting/index', {
                                title: 'Setting',
                                web_title: req.body.website_title,
                                web_name: req.body.website_name,
                                alert:'Website update successfully',
                                logo_content: 'text',
                                logo : req.body.website_name
                            });
                        }
                    });
                } else {
                    new Setting({web_title: req.body.website_title, web_name: req.body.website_name}).save(function(err,list){
                        if(err){
                            return handleError(err);
                        } else {
                            res.render('setting/index', {
                                title: 'Setting',
                                web_title: req.body.website_title,
                                web_name: req.body.website_name,
                                alert:'Website update successfully',
                                logo_content: 'text',
                                logo : req.body.website_name
                            });
                        }
                    });
                }
            });
        // Logo is image
        } else {
            // type of file upload is jpg or png
            if (req.files.image.type == 'image/jpeg' || req.files.image.type == 'image/png') {
                Setting.find().exec(function(err, setting) {
                    if ( setting.length == 1 ) {
                        Setting.update({web_title: req.body.website_title},function(err,list){
                            res.render('setting/index', {
                                title: 'Setting',
                                web_title:  setting[0].web_title,
                                web_name: setting[0].web_name,
                                alert:'Website update successfully',
                                logo_content: 'image'
                            });
                        });
                    } else {
                        new Setting({web_title: req.body.website_title, web_name: req.body.website_name}).save(function(err,list){
                            res.render('setting/index', {
                                title: 'Setting',
                                web_title: req.body.website_title,
                                alert:'Website update successfully',
                                logo_content: 'image'
                            });
                        });
                    }
                });
                if(req.files.image.size == 0) {
                    fs.rename(tmp_path, target_path, function(err) {
                        if (err) throw err;
                        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                        fs.unlink(tmp_path, function() {
                            if (err) throw err;
                        });
                        fs.unlink(target_path, function() {
                            if (err) throw err;
                        });
                    });
                } else {
                    // move the file from the temporary location to the intended location
                    fs.rename(tmp_path, target_path, function(err) {
                        if (err) throw err;
                        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                        fs.unlink(tmp_path, function() {
                            if (err) throw err;
                        });
                    });
                }
            // type of file upload is not image
            } else {
                fs.rename(tmp_path, target_path, function(err) {
                    if (err) throw err;
                    // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
                    fs.unlink(tmp_path, function() {
                        if (err) throw err;
                    });
                    fs.unlink(target_path, function() {
                        if (err) throw err;
                    });
                });
                res.render('setting/index', {
                    title:        'Setting',
                    web_title:    req.body.website_title,
                    alert:        'Only upload file png and jpg',
                    logo_content: 'text',
                    danger:        'danger',
                    logo:         req.body.website_name
                });
            }
        }
    //Get index
    } else {
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
        Setting.find().exec(function(err, setting){
            if ( setting.length == 1 ) {
                res.render('setting/index', {
                    title: 'Setting',
                    alert:'',
                    web_name: setting[0].web_name,
                    web_title: setting[0].web_title,
                    logo_content: logo_content,
                    logo :  web_name
                });
            } else {
                res.render('setting/index', {
                    title: 'Setting',
                    alert:'',
                    web_name: config.app.name,
                    web_title: config.app.name,
                    logo_content: logo_content,
                    logo :  web_name
                });
            }
        });
    }
}