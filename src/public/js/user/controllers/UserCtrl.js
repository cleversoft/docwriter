angular
    .module('app.user')
    .controller('UserCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle = 'Users';
        $scope.users         = [];

        UserService
            .list()
            .success(function(data) {
                $scope.users = data.users;
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