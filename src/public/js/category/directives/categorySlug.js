angular
    .module('app.category')
    .directive('categorySlug', ['CategoryService', function(CategoryService) {
        return {
            restrict: 'A',
            scope: {
                from: '=',
                ngModel: '='
            },
            link: function(scope, ele, attrs) {
                scope.$watch('from', function(val) {
                    if (!val) {
                        scope.ngModel = '';
                        return;
                    }
                    CategoryService
                        .generateSlug(val)
                        .success(function(data) {
                            scope.ngModel = data.slug;
                        });
                });
            }
        };
    }]);