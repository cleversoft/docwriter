angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', '$location', '_', 'growlNotifications', '$modal', 'socket', 'PostService', function($scope, $rootScope, $location, _, growlNotifications, $modal, socket, PostService) {
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

        PostService
            .list($scope.criteria)
            .success(function(data) {
                $scope.posts      = data.posts;
                $scope.pagination = data.pagination;
            });

        // Init the socket
        socket.on('connect', function() {
            socket.on('/job/exportPdf/started', function(data) {

            });

            socket.on('/jobs/exportPdf/done', function(data) {
                var post = _.find($scope.posts, function(p) {
                    return p._id + '' === data.post_id;
                });
                if (post) {
                    post.pdf = post.pdf || {};
                    post.pdf.status   = 'done';
                    post.pdf.username = data.username;
                    post.pdf.email    = data.email;
                    post.pdf.date     = data.date;
                }
            });
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

                                growlNotifications.add('<strong>' + selected.title + '</strong> is removed', 'success');
                            }
                        });
                }, function() {
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

        /**
         * Export to PDF
         */
        $scope.exportPdf = function(post) {
            socket.emit('/job/exportPdf/starting', {
                id: post._id,
                user: $scope.currentUser.username
            });

            PostService
                .exportPdf(post._id)
                .success(function(data) {

                });
        };
    }]);