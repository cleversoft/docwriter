angular
    .module('app.user')
    .factory('TokenInterceptor', ['$rootScope', '$q', '$location', 'AUTH_EVENTS', 'AuthService', function($rootScope, $q, $location, AUTH_EVENTS, AuthService) {
        return {
            response: function(response) {
                if (response !== null && response.status === 200 && !AuthService.isAuthenticated) {
                    AuthService.isAuthenticated = true;
                }
                return response || $q.when(response);
            },

            responseError: function(response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);

                return $q.reject(response);
            }
        };
    }]);