angular
    .module('app.post')
    .directive('postSlug', ['PostService', function(PostService) {
        return {
            restrict: 'A',
            scope: {
                postTitle: '=',
                postId: '=',
                ngModel: '='
            },
            link: function(scope, ele, attrs) {
                scope.$watch('postTitle', function(val) {
                    if (!val) {
                        scope.ngModel = '';
                        return;
                    }
                    PostService
                        .generateSlug(val, scope.postId)
                        .success(function(data) {
                            scope.ngModel = data.slug;
                        });
                });
            }
        };
    }]);