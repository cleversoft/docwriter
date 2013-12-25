var url = require('url'),
    qs  = require('querystring');

module.exports = function(req, params, excludedParams) {
    var urlParams = qs.parse(url.parse(req.url).query);
    for (var k in params) {
        urlParams[k] = params[k];
    }
    if (excludedParams) {
        for (k in excludedParams) {
            delete urlParams[excludedParams[k]];
        }
    }

    // Remove empty params
    for (k in urlParams) {
        if (!urlParams[k]) {
            delete urlParams[k];
        }
    }

    return '?' + qs.stringify(urlParams);
};