angular
    .module('app.category')
    .controller('CategoryCtrl', ['$scope', '$rootScope', '_', '$modal', 'CategoryService', function($scope, $rootScope, _, $modal, CategoryService) {
        $rootScope.pageTitle = 'Categories';
        $scope.categories    = [];
        $scope.selected      = null;

        CategoryService
            .list()
            .success(function(data) {
                $scope.categories = data.categories;
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
                            }
                        });
                }, function() {
                });
        };
    }]);