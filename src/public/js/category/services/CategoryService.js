angular
    .module('app.category')
    .factory('CategoryService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
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

            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category');
            },

            order: function(id, position) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/order', {
                    id: id,
                    position: position
                });
            },

            remove: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/remove', {
                    id: id
                });
            },

            save: function(category) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/save/' + category._id, category);
            }
        };
    }]);