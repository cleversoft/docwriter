angular
    .module('app.category')
    .factory('CategoryService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category');
            },

            add: function(category) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/add', category);
            }
        };
    }]);