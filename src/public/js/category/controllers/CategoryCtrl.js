angular
    .module('app.category')
    .controller('CategoryCtrl', ['$scope', '$rootScope', '_', '$modal', 'CategoryService', function($scope, $rootScope, _, $modal, CategoryService) {
        $rootScope.pageTitle = 'Categories';
        $scope.categories    = [];
        $scope.selected      = null;
        $scope.ordering      = false;

        CategoryService
            .list()
            .success(function(data) {
                for (var i = 0; i < data.categories.length; i++) {
                    var category = data.categories[i];
                    category.index = i;
                    $scope.categories.push(category);
                }
            });

        $scope.confirm = function(category) {
            $scope.selected = category;

            // Show the modal
            $modal
                .open({
                    templateUrl: 'removeCategoryModal.html',
                    size: 'sm',
                    controller: function($scope, $modalInstance, selected) {
                        $scope.selected = selected;

                        $scope.remove = function() {
                            $modalInstance.close($scope.selected);
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
                        selected: function() {
                            return category;
                        }
                    }
                })
                .result
                .then(function(selected) {
                    CategoryService
                        .remove(selected._id)
                        .success(function(data) {
                            if (data.msg === 'ok') {
                                // Remove from the collections
                                _.remove($scope.categories, function(item) {
                                    return item._id === selected._id;
                                });
                                // Update the index
                                for (var i = 0; i < $scope.categories.length; i++) {
                                    $scope.categories[i].index = i;
                                }
                            }
                        });
                }, function() {
                });
        };

        $scope.order = function(category, direction) {
            $scope.ordering = true;

            var index    = category.index,
                newIndex = index + (direction === 'up' ? -1 : 1);
            CategoryService
                .order(category._id, newIndex)
                .success(function(data) {
                    $scope.ordering = false;
                    if (data.msg === 'ok') {
                        var c = $scope.categories[newIndex];
                        $scope.categories[newIndex] = category;
                        category.index = newIndex;

                        $scope.categories[index] = c;
                        c.index = index;
                    }
                });
        };
    }]);