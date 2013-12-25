exports.index = function(req, res) {
    res.render('user/index', {
        title: 'Users'
    });
};