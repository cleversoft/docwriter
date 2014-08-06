angular
    .module('app.user')
    .directive('loginModal', ['$modal', 'AUTH_EVENTS', 'AuthService', function($modal, AUTH_EVENTS, AuthService) {
        return {
            restrict: 'A',
            template: '<div ng-if="visible">',
            //template: '<div ng-if="visible" ng-include="\'js/views/auth/signin.html\'">',
            link: function(scope) {
                var $modalInstance,
                    showModal = function() {
                        scope.visible  = true;
                        $modalInstance = $modalInstance || $modal.open({
                            templateUrl: '/js/user/views/signin.html',
                            size: 'sm',
                            backdrop: 'static',
                            keyboard: false
                        });
                    };

                scope.visible = !AuthService.isAuthenticated;

                if (scope.visible) {
                    showModal();
                }

                scope.$on(AUTH_EVENTS.loginSuccess, function() {
                    scope.visible = false;
                    $modalInstance.dismiss();
                    $modalInstance = null;
                });
                scope.$on(AUTH_EVENTS.loginFailed,      showModal);
                scope.$on(AUTH_EVENTS.notAuthenticated, showModal);
                scope.$on(AUTH_EVENTS.sessionTimeout,   showModal);
            }
        };
    }]);