angular
    .module('app.user')
    .controller('AuthCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', function($scope, $rootScope, AUTH_EVENTS, AuthService) {
        $rootScope.pageTitle = 'Signin';
        $scope.credentials   = {
            username: null,
            password: null
        };

        $scope.signin = function(credentials) {
            $scope.error = null;

            if (credentials.username && credentials.password) {
                AuthService
                    .signin(credentials.username, credentials.password)
                    .success(function(data) {
                        AuthService.isAuthenticated = true;
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, { user: data.user });
                    })
                    .error(function(status, data) {
                        $scope.error = status.msg;
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    });
            }
        };
    }]);