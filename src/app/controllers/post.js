exports.index = function(req, res) {
    res.render('post/index', {
        title: 'Posts'
    });
};

exports.add = function(req, res) {
    res.render('post/add', {
        title: 'Write new post'
    });
};