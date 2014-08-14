angular
    .module('app.category')
    .controller('AddCategoryCtrl', ['$scope', '$rootScope', 'growlNotifications', 'CategoryService', function($scope, $rootScope, growlNotifications, CategoryService) {
        $rootScope.pageTitle = 'Add new category';
        $scope.category      = null;
        $scope.msg           = null;

        $scope.save = function() {
            if (!$scope.category) {
                $scope.msg = 'Please fill in the form';
                return;
            }

            var required = {
                name: 'The name is required',
                slug: 'The slug is required'
            };

            for (var key in required) {
                if (!$scope.category[key]) {
                    $scope.msg = required[key];
                    return;
                }
            }

            CategoryService
                .add($scope.category)
                .success(function(data) {
                    $scope.msg = data.msg === 'ok' ? null : data.msg;
                    if (data.msg === 'ok') {
                        growlNotifications.add('<strong>' + $scope.category.name + '</strong> is added', 'success');
                        $scope.category = null;
                    }
                });
        };
    }]);