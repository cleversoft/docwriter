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
            },

            generateSlug: function(name, id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/slug', { name: name, id: id });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/category/get/' + id);
            },

            save: function(category) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/save/' + category._id, category);
            }
        };
    }]);