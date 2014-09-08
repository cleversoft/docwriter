angular
    .module('app.post')
    .controller('ExportPdf', ['$scope', function($scope) {
        $scope.tasks = [];

        $scope.$on('job:exportPdf:starting', function(e, data) {
            $scope.tasks.push({
                post_id: data.post_id,
                title: data.title.substr(0, 60)
            });
        });
    }]);