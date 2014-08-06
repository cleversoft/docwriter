angular
    .module('app.user')
    .factory('AuthService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            isAuthenticated: false,

            signin: function(username, password) {
                // Retrieve $http via $injector to prevent circular dependency
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/signin', {
                    username: username,
                    password: password
                });
            },

            signout: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/signout');
            },

            me: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/me');
            }
        };
    }]);