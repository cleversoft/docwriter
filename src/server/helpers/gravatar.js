var crypto = require('crypto');

module.exports = function(email) {
    return 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(email).digest('hex');
};