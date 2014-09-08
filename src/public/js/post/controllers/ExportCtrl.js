angular
    .module('app.post')
    .controller('ExportPdf', ['$scope', '_', 'growlNotifications', function($scope, _, growlNotifications) {
        $scope.tasks = [];

        $scope.$on('job:exportPdf:starting', function(e, data) {
            $scope.tasks.push({
                post_id: data.post_id,
                title: data.title.substr(0, 60)
            });
        });

        $scope.$on('job:exportPdf:done', function(e, data) {
            growlNotifications.add('<strong>' + data.title + '</strong> is exported to PDF', 'success');
            _.remove($scope.tasks, function(item) {
                return item.post_id === data.post_id;
            });
        });
    }]);