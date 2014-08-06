angular
    .module('app.user')
    .factory('UserService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            changePassword: function(currentPassword, newPassword) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/password', {
                    password: currentPassword,
                    new_password: newPassword
                });
            },

            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user');
            },

            lock: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/lock', {
                    id: id
                });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/user/get/' + id);
            },

            save: function(user) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/save/' + user._id, user);
            },

            add: function(user) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/add', user);
            }
        };
    }]);