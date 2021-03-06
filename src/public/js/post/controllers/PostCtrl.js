angular
    .module('app.post')
    .controller('PostCtrl', [
        '$scope', '$rootScope', '$location',
        '_', 'growlNotifications', '$modal',
        'AUTH_EVENTS', 'PostService',
        function($scope, $rootScope, $location,
                 _, growlNotifications, $modal,
                 AUTH_EVENTS, PostService) {
        $rootScope.pageTitle = 'Posts';
        $scope.posts         = [];

        var qs = $location.search();
        $scope.criteria = {
            page: qs.page || 1,
            keyword: qs.q || null,
            status: qs.status || null
        };

        $scope.pagination = {
            total_items: 0,
            per_page: 10,
            current_page: 1,
            num_pages: 1
        };

        $scope.load = function() {
            PostService
                .list($scope.criteria)
                .success(function(data) {
                    $scope.posts      = data.posts;
                    $scope.pagination = data.pagination;
                });
        };
        $scope.load();

        $scope.$on(AUTH_EVENTS.loginSuccess, function() {
            $scope.load();
        });

        $scope.search = function() {
            $location.search({
                q: $scope.criteria.keyword
            });
        };

        $scope.filter = function(status) {
            $location.search('page', '1');
            $location.search('status', status || null);
        };

        /**
         * Go to other page
         */
        $scope.jump = function() {
            $location.search('page', $scope.pagination.current_page + '');
        };

        /**
         * Duplicate post
         */
        $scope.duplicate = function(post) {
            PostService
                .duplicate(post._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        $scope.posts.push(data.post);
                        growlNotifications.add('<strong>' + post.title + '</strong> is duplicated', 'success');
                    }
                });
        };

        $scope.publish = function(post) {
            PostService
                .activate(post._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        post.status = (post.status === 'activated') ? 'deactivated' : 'activated';
                        growlNotifications.add('<strong>' + post.title + '</strong> is ' + (post.status === 'deactivated' ? 'unpublished' : 'published'), 'success');
                    }
                });
        };

        $scope.pushToTrash = function(post) {
            PostService
                .pushToTrash(post._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        post.status = 'trash';
                        growlNotifications.add('<strong>' + post.title + '</strong> is pushed to Trash', 'success');
                    }
                });
        };

        $scope.remove = function(post) {
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

                                growlNotifications.add('<strong>' + selected.title + '</strong> is removed', 'success');
                            }
                        });
                }, function() {
                });
        };
    }]);