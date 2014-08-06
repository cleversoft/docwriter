angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.pageTitle = 'Posts';
    }]);