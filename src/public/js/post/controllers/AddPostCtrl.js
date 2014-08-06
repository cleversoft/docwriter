angular
    .module('app.post')
    .controller('AddPostCtrl', ['$scope', '$rootScope', 'CategoryService', function($scope, $rootScope, CategoryService) {
        $rootScope.pageTitle = 'Add new post';
        $scope.categories    = [];
        $scope.post          = {
            heading_styles: 'none'
        };

        CategoryService
            .list()
            .success(function(data) {
                $scope.categories = data.categories;
            });
    }]);