angular
    .module('app.user')
    .controller('UserCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'UserService', function($scope, $rootScope, AUTH_EVENTS, UserService) {
        $rootScope.pageTitle = 'Users';
        $scope.users         = [];

        $scope.load = function() {
            UserService
                .list()
                .success(function(data) {
                    $scope.users = data.users;
                });
        };
        $scope.load();

        $scope.$on(AUTH_EVENTS.loginSuccess, function() {
            $scope.load();
        });

        $scope.lock = function(user) {
            UserService
                .lock(user._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        user.locked = !user.locked;
                    }
                });
        };
    }]);