angular
    .module('app.user')
    .controller('EditUserCtrl', ['$scope', '$rootScope', '$routeParams', 'UserService', function($scope, $rootScope, $routeParams, UserService) {
        $rootScope.pageTitle = 'Edit the user';
        $scope.user          = null;

        UserService
            .get($routeParams.id)
            .success(function(data) {
                if (data.msg === 'ok') {
                    $scope.user = data.user;
                }
            });

        $scope.save = function() {
            if (!$scope.user) {
                return;
            }
            if ($scope.user.newPassword !== '' && $scope.user.newPassword === $scope.user.confirmPassword) {
                $scope.user.password = $scope.user.newPassword;
            }
            UserService
                .save($scope.user)
                .success(function(data) {
                    $scope.msg = data.msg;
                });
        };
    }]);