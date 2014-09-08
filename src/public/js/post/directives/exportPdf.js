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
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {
                $scope.exportPdf = function(post) {
                    $rootScope.$broadcast('job:exportPdf:starting', {
                        post_id: post._id,
                        title: post.title
                    });
                };
            }],
            link: function(scope, ele, attrs) {

            }
        };
    }]);