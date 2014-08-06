angular
    .module('app.user')
    .controller('AddUserCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle = 'Add new user';
        $scope.user          = null;

        $scope.save = function() {
            if (!$scope.user) {
                $scope.msg = 'Please fill in the form';
                return;
            }

            var required = {
                username: 'The username is required',
                email: 'The email address is required',
                password: 'The password is required',
                role: 'The role is required'
            };

            for (var key in required) {
                if (!$scope.user[key]) {
                    $scope.msg = required[key];
                    return;
                }
            }

            UserService
                .add($scope.user)
                .success(function(data) {
                    $scope.msg = data.msg;
                    if (data.msg === 'ok') {
                        $scope.user = null;
                    }
                });
        };
    }]);