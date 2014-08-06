angular
    .module('app.admin')
    .controller('AppCtrl', ['$scope', '$rootScope', '$window', 'AUTH_EVENTS', 'AuthService', function($scope, $rootScope, $window, AUTH_EVENTS, AuthService) {
        $scope.loadingDone = false;
        $scope.currentUser = null;

        $scope.$on(AUTH_EVENTS.loginSuccess, function(e, data) {
            $scope.currentUser = data.user;
        });

        $scope.signout = function() {
            $scope.currentUser = null;
            AuthService
                .signout()
                .success(function(data) {
                    AuthService.isAuthenticated = false;
                    $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
                })
                .error(function(status, data) {
                });
        };

        AuthService
            .me()
            .success(function(data) {
                AuthService.isAuthenticated = true;
                $scope.currentUser = data.user;
            })
            .error(function() {
                AuthService.isAuthenticated = false;
                $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
            })
            .finally(function() {
                $scope.loadingDone = true;
            });
    }]);