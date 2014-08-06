angular
    .module('app.category')
    .controller('CategoryCtrl', ['$scope', '$rootScope', 'CategoryService', function($scope, $rootScope, CategoryService) {
        $rootScope.pageTitle = 'Categories';
        $scope.categories    = [];

        CategoryService
            .list()
            .success(function(data) {
                $scope.categories = data.categories;
            });
    }]);