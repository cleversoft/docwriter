exports.index = function(req, res) {
    res.render('category/index', {
        title: 'Categories'
    });
};