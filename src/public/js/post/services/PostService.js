angular
    .module('app.post')
    .factory('PostService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            activate: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/activate/' + id);
            },

            add: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/add', post);
            },

            duplicate: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/duplicate/' + id);
            },

            exportPdf: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/pdf/export/' + id);
            },

            generateSlug: function(title, id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/slug', { title: title, id: id });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/post/get/' + id);
            },

            list: function(criteria) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post', criteria);
            },

            pushToTrash: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/trash/' + id);
            },

            remove: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/remove/' + id);
            },

            save: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/save/' + post._id, post);
            }
        };
    }]);