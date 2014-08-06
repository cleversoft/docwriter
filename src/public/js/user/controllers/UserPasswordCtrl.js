angular
    .module('app.user')
    .controller('UserPasswordCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle   = 'Change password';
        $scope.currentPassword = '';
        $scope.newPassword     = '';
        $scope.confirmPassword = '';

        $scope.change = function() {
            if ($scope.currentPassword === '' || $scope.newPassword === '' || $scope.confirmPassword === '' || $scope.newPassword !== $scope.confirmPassword) {
                return;
            }

            UserService
                .changePassword($scope.currentPassword, $scope.newPassword)
                .success(function(data) {
                    $scope.msg = data.msg;
                })
                .error(function(data) {
                });
        };
    }]);