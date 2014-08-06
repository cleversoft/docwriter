angular
    .module('app.category')
    .controller('EditCategoryCtrl', ['$scope', '$rootScope', '$routeParams', 'CategoryService', function($scope, $rootScope, $routeParams, CategoryService) {
        $rootScope.pageTitle = 'Edit the category';
        $scope.category      = null;

        CategoryService
            .get($routeParams.id)
            .success(function(data) {
                if (data.msg === 'ok') {
                    $scope.category = data.category;
                }
            });

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
                .save($scope.category)
                .success(function(data) {
                    $scope.msg = data.msg;
                });
        };
    }]);