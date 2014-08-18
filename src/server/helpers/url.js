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
    var numParams = 0;
    for (k in urlParams) {
        numParams++;
        if (!urlParams[k]) {
            numParams--;
            delete urlParams[k];
        }
    }

    return (numParams == 0) ? '' : '?' + qs.stringify(urlParams);
};