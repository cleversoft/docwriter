angular
    .module('app.post')
    .directive('exportPdf', [function() {
        return {
            restrict: 'E',
            scope: {
                ngModel: '='
            },
            template:   '<button type="button" class="btn btn-default" ng-click="exportPdf(ngModel)" ng-disabled="ngModel.status !== \'activated\'">Export</button>' +
                        '<span ng-show="ngModel.pdf">' +
                            '<img gravatar-src="ngModel.pdf.email" gravatar-size="50" class="dw-avatar" title="{{ ngModel.pdf.username }}" /> <span am-time-ago="ngModel.pdf.date">' +
                        '</span>',
            controller: ['$scope', '$rootScope', 'socket', 'PostService', function($scope, $rootScope, socket, PostService) {
                $scope.post = {};

                socket.on('connect', function() {
                    socket.on('jobs:exportPdf:done', function(data) {
                        if (data.post_id + '' === $scope.post._id) {
                            $scope.post.pdf          = $scope.post.pdf || {};
                            $scope.post.status       = 'activated';
                            $scope.post.pdf.status   = 'done';
                            $scope.post.pdf.username = data.username;
                            $scope.post.pdf.email    = data.email;
                            $scope.post.pdf.date     = data.date;
                        }
                    });
                });

                $scope.exportPdf = function(post) {
                    $scope.post = post;

                    $rootScope.$broadcast('job:exportPdf:starting', {
                        post_id: post._id,
                        title: post.title
                    });

                    PostService
                        .exportPdf(post._id)
                        .success(function(data) {
                            $rootScope.$broadcast('job:exportPdf:done', {
                                post_id: post._id,
                                title: post.title
                            });
                        });
                };
            }],
            link: function(scope, ele, attrs) {

            }
        };
    }]);