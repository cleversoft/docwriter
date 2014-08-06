angular
    .module('app.category')
    .directive('categorySlug', ['CategoryService', function(CategoryService) {
        return {
            restrict: 'A',
            scope: {
                categoryName: '=',
                categoryId: '=',
                ngModel: '='
            },
            link: function(scope, ele, attrs) {
                scope.$watch('categoryName', function(val) {
                    if (!val) {
                        scope.ngModel = '';
                        return;
                    }
                    CategoryService
                        .generateSlug(val, scope.categoryId)
                        .success(function(data) {
                            scope.ngModel = data.slug;
                        });
                });
            }
        };
    }]);