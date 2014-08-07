angular
    .module('app.post', ['ngSanitize'])
    .controller('AddPostCtrl', ['$scope', '$rootScope', 'marked', 'CategoryService', function($scope, $rootScope, marked, CategoryService) {
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

        $scope.preview = function() {
            $scope.html = marked($scope.post.content || '', {
                renderer: new marked.Renderer({
                    heading: function(text, level) {
                        // I don't want to include an auto-generated ID of heading
                        return '<h' + level + '>' + text + '</h' + level + '>';
                    }
                })
            });
        };
    }]);