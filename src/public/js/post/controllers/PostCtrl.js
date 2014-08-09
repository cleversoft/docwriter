angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', 'PostService', function($scope, $rootScope, PostService) {
        $rootScope.pageTitle = 'Posts';
        $scope.posts         = [];

        PostService
            .list()
            .success(function(data) {
                $scope.posts = data.posts;
            });
    }]);