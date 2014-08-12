angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', '_', '$modal', 'PostService', function($scope, $rootScope, _, $modal, PostService) {
        $rootScope.pageTitle = 'Posts';
        $scope.posts         = [];

        PostService
            .list()
            .success(function(data) {
                $scope.posts = data.posts;
            });

        $scope.confirm = function(post) {
            $scope.selected = post;

            // Show the modal
            $modal
                .open({
                    templateUrl: 'removePostModal.html',
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
                            return post;
                        }
                    }
                })
                .result
                .then(function(selected) {
                    PostService
                        .remove(selected._id)
                        .success(function(data) {
                            if (data.msg === 'ok') {
                                // Remove from the collections
                                _.remove($scope.posts, function(item) {
                                    return item._id === selected._id;
                                });
                            }
                        });
                }, function() {
                });
        };
    }]);