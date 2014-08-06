angular
    .module('app.category')
    .controller('AddCategoryCtrl', ['$scope', '$rootScope', 'CategoryService', function($scope, $rootScope, CategoryService) {
        $rootScope.pageTitle = 'Add new category';
        $scope.category      = null;

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
                    $scope.msg = data.msg;
                    if (data.msg === 'ok') {
                        $scope.category = null;
                    }
                });
        };
    }]);