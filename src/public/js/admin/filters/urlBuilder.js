angular
    .module('app.admin')
    .filter('urlBuilder', ['$window', '$location', function($window, $location) {
        return function(input, params, excludedParams) {
            var urlParams = {};
            angular.extend(urlParams, $location.search());

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

            var arr = [];
            for (k in urlParams) {
                arr.push(k + '=' + urlParams[k]);
                //arr.push(k + '=' + decodeURIComponent(urlParams[k]));
            }

            return (numParams == 0) ? input : input + '?' + arr.join('&');
        };
    }]);