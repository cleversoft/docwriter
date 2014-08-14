angular
    .module('app.category')
    .controller('EditCategoryCtrl', ['$scope', '$rootScope', '$routeParams', 'growlNotifications', 'CategoryService', function($scope, $rootScope, $routeParams, growlNotifications, CategoryService) {
        $rootScope.pageTitle = 'Edit the category';
        $scope.category      = null;
        $scope.msg           = null;

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
                    $scope.msg = data.msg === 'ok' ? null : data.msg;
                    if (data.msg === 'ok') {
                        growlNotifications.add('<strong>' + $scope.category.name + '</strong> is updated', 'success');
                    }
                });
        };
    }]);