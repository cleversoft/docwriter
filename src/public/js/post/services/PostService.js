angular
    .module('app.post')
    .factory('PostService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            add: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/add', post);
            },

            generateSlug: function(title, id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/slug', { title: title, id: id });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/post/get/' + id);
            },

            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post');
            },

            remove: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/remove', {
                    id: id
                });
            },

            save: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/save/' + post._id, post);
            }
        };
    }]);