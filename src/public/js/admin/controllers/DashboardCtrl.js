angular
    .module('app.admin')
    .controller('DashboardCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.pageTitle = 'Dashboard';
    }]);