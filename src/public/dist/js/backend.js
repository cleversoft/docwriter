angular.module('app.admin',    []);
angular.module('app.category', []);
angular.module('app.post',     []);
angular.module('app.user',     []);

angular
    .module('app', ['ngRoute', 'angularFileUpload', 'ui.bootstrap', 'ui.codemirror', 'app.admin', 'app.category', 'app.post', 'app.user'])
    .constant('API', {
        baseUrl: ''
    })
    .constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    // Use lodash
    .constant('_', window._)
    .constant('marked', window.marked)
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider

            // admin module
            .when('/', {
                templateUrl: '/js/admin/views/dashboard.html',
                controller: 'DashboardCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // category module
            .when('/category', {
                templateUrl: '/js/category/views/index.html',
                controller: 'CategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/category/add', {
                templateUrl: '/js/category/views/add.html',
                controller: 'AddCategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/category/edit/:id', {
                templateUrl: '/js/category/views/edit.html',
                controller: 'EditCategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // post module
            .when('/post', {
                templateUrl: '/js/post/views/index.html',
                controller: 'PostCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/post/add', {
                templateUrl: '/js/post/views/add.html',
                controller: 'AddPostCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // user module
            .when('/user', {
                templateUrl: '/js/user/views/index.html',
                controller: 'UserCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/user/password', {
                templateUrl: '/js/user/views/password.html',
                controller: 'UserPasswordCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/user/add', {
                templateUrl: '/js/user/views/add.html',
                controller: 'AddUserCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/user/edit/:id', {
                templateUrl: '/js/user/views/edit.html',
                controller: 'EditUserCtrl',
                data: {
                    requiredAuthentication: true
                }
            });

        //$locationProvider.html5Mode(true);
    }])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('TokenInterceptor');
    }])
    .run(['$rootScope', 'AUTH_EVENTS', 'AuthService', function($rootScope, AUTH_EVENTS, AuthService) {
        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            if (nextRoute !== null && nextRoute.data && nextRoute.data.requiredAuthentication && !AuthService.isAuthenticated) {
                // User isn't logged in yet
                event.preventDefault();
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
        });
    }]);

angular
    .module('app.admin')
    .controller('AppCtrl', ['$scope', '$rootScope', '$window', 'AUTH_EVENTS', 'AuthService', function($scope, $rootScope, $window, AUTH_EVENTS, AuthService) {
        $scope.loadingDone = false;
        $scope.currentUser = null;

        $scope.$on(AUTH_EVENTS.loginSuccess, function(e, data) {
            $scope.currentUser = data.user;
        });

        $scope.signout = function() {
            $scope.currentUser = null;
            AuthService
                .signout()
                .success(function(data) {
                    AuthService.isAuthenticated = false;
                    $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
                })
                .error(function(status, data) {
                });
        };

        AuthService
            .me()
            .success(function(data) {
                AuthService.isAuthenticated = true;
                $scope.currentUser = data.user;
            })
            .error(function() {
                AuthService.isAuthenticated = false;
                $scope.$broadcast(AUTH_EVENTS.notAuthenticated);
            })
            .finally(function() {
                $scope.loadingDone = true;
            });
    }]);
angular
    .module('app.admin')
    .controller('DashboardCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.pageTitle = 'Dashboard';
    }]);
angular
    .module('app.category')
    .controller('AddCategoryCtrl', ['$scope', '$rootScope', 'CategoryService', function($scope, $rootScope, CategoryService) {
        $rootScope.pageTitle = 'Add new category';
        $scope.category      = null;

        $scope.save = function() {
            if (!$scope.category) {
                $scope.msg = 'Please fill in the form';
                return;
            }

            var required = {
                name: 'The name is required',
                slug: 'The slug is required'
            };

            for (var key in required) {
                if (!$scope.category[key]) {
                    $scope.msg = required[key];
                    return;
                }
            }

            CategoryService
                .add($scope.category)
                .success(function(data) {
                    $scope.msg = data.msg;
                    if (data.msg === 'ok') {
                        $scope.category = null;
                    }
                });
        };
    }]);
angular
    .module('app.category')
    .controller('CategoryCtrl', ['$scope', '$rootScope', '_', '$modal', 'CategoryService', function($scope, $rootScope, _, $modal, CategoryService) {
        $rootScope.pageTitle = 'Categories';
        $scope.categories    = [];
        $scope.selected      = null;
        $scope.ordering      = false;

        CategoryService
            .list()
            .success(function(data) {
                for (var i = 0; i < data.categories.length; i++) {
                    var category = data.categories[i];
                    category.index = i;
                    $scope.categories.push(category);
                }
            });

        $scope.confirm = function(category) {
            $scope.selected = category;

            // Show the modal
            $modal
                .open({
                    templateUrl: 'removeCategoryModal.html',
                    size: 'sm',
                    controller: function($scope, $modalInstance, selected) {
                        $scope.selected = selected;

                        $scope.remove = function() {
                            $modalInstance.close($scope.selected);
                        };

                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    resolve: {
                        selected: function() {
                            return category;
                        }
                    }
                })
                .result
                .then(function(selected) {
                    CategoryService
                        .remove(selected._id)
                        .success(function(data) {
                            if (data.msg === 'ok') {
                                // Remove from the collections
                                _.remove($scope.categories, function(item) {
                                    return item._id === selected._id;
                                });
                                // Update the index
                                for (var i = 0; i < $scope.categories.length; i++) {
                                    $scope.categories[i].index = i;
                                }
                            }
                        });
                }, function() {
                });
        };

        $scope.order = function(category, direction) {
            $scope.ordering = true;

            var index    = category.index,
                newIndex = index + (direction === 'up' ? -1 : 1);
            CategoryService
                .order(category._id, newIndex)
                .success(function(data) {
                    $scope.ordering = false;
                    if (data.msg === 'ok') {
                        var c = $scope.categories[newIndex];
                        $scope.categories[newIndex] = category;
                        category.index = newIndex;

                        $scope.categories[index] = c;
                        c.index = index;
                    }
                });
        };
    }]);
angular
    .module('app.category')
    .controller('EditCategoryCtrl', ['$scope', '$rootScope', '$routeParams', 'CategoryService', function($scope, $rootScope, $routeParams, CategoryService) {
        $rootScope.pageTitle = 'Edit the category';
        $scope.category      = null;

        CategoryService
            .get($routeParams.id)
            .success(function(data) {
                if (data.msg === 'ok') {
                    $scope.category = data.category;
                }
            });

        $scope.save = function() {
            if (!$scope.category) {
                $scope.msg = 'Please fill in the form';
                return;
            }

            var required = {
                name: 'The name is required',
                slug: 'The slug is required'
            };

            for (var key in required) {
                if (!$scope.category[key]) {
                    $scope.msg = required[key];
                    return;
                }
            }

            CategoryService
                .save($scope.category)
                .success(function(data) {
                    $scope.msg = data.msg;
                });
        };
    }]);
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
angular
    .module('app.category')
    .factory('CategoryService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            add: function(category) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/add', category);
            },

            generateSlug: function(name, id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/slug', { name: name, id: id });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/category/get/' + id);
            },

            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category');
            },

            order: function(id, position) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/order', {
                    id: id,
                    position: position
                });
            },

            remove: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/remove', {
                    id: id
                });
            },

            save: function(category) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/category/save/' + category._id, category);
            }
        };
    }]);
angular
    .module('app.post', ['ngSanitize'])
    .controller('AddPostCtrl', ['$scope', '$rootScope', 'marked', '$upload', 'API', 'CategoryService', function($scope, $rootScope, marked, $upload, API, CategoryService) {
        $rootScope.pageTitle = 'Add new post';
        $scope.categories    = [];
        $scope.post          = {
            heading_styles: 'none'
        };
        $scope.html          = '';
        $scope.editor        = null;
        $scope.editorOptions = {
            mode: 'markdown',
            lineNumbers: true,
            matchBrackets: true,
            lineWrapping: true,
            theme: 'default'
        };

        CategoryService
            .list()
            .success(function(data) {
                $scope.categories = data.categories;
            });

        $scope.editorLoaded = function(editor) {
            $scope.editor = editor;

            editor.on('change', function(instance) {
                // Simple hack to set the content
                // If I set ng-model="post.content" for the editor, I can't insert data to it
                // via $scope.editor.getDoc().replaceSelection(...);
                $scope.post.content = instance.getValue();
            });
        };

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

        $scope.upload = function($files) {
            $upload.upload({
                url: API.baseUrl + '/file/upload',
                file: $files
            }).success(function(data, status, headers, config) {
                var files = data.files;
                for (var i = 0; i < files.length; i++) {
                    var text = ['[', files[i].title, '](', files[i].url, ')'].join('');
                    if (['bmp', 'gif', 'jpeg', 'jpg', 'png'].indexOf(files[i].extension.toLowerCase()) != -1) {
                        text = '!' + text;
                    }
                    $scope.editor.getDoc().replaceSelection(text);
                }
            });
        };
    }]);
angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.pageTitle = 'Posts';
    }]);
angular
    .module('app.user')
    .controller('AddUserCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle = 'Add new user';
        $scope.user          = null;

        $scope.save = function() {
            if (!$scope.user) {
                $scope.msg = 'Please fill in the form';
                return;
            }

            var required = {
                username: 'The username is required',
                email: 'The email address is required',
                password: 'The password is required',
                role: 'The role is required'
            };

            for (var key in required) {
                if (!$scope.user[key]) {
                    $scope.msg = required[key];
                    return;
                }
            }

            UserService
                .add($scope.user)
                .success(function(data) {
                    $scope.msg = data.msg;
                    if (data.msg === 'ok') {
                        $scope.user = null;
                    }
                });
        };
    }]);
angular
    .module('app.user')
    .controller('AuthCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', function($scope, $rootScope, AUTH_EVENTS, AuthService) {
        $rootScope.pageTitle = 'Signin';
        $scope.credentials   = {
            username: null,
            password: null
        };

        $scope.signin = function(credentials) {
            $scope.error = null;

            if (credentials.username && credentials.password) {
                AuthService
                    .signin(credentials.username, credentials.password)
                    .success(function(data) {
                        AuthService.isAuthenticated = true;
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, { user: data.user });
                    })
                    .error(function(status, data) {
                        $scope.error = status.msg;
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    });
            }
        };
    }]);
angular
    .module('app.user')
    .controller('EditUserCtrl', ['$scope', '$rootScope', '$routeParams', 'UserService', function($scope, $rootScope, $routeParams, UserService) {
        $rootScope.pageTitle = 'Edit the user';
        $scope.user          = null;

        UserService
            .get($routeParams.id)
            .success(function(data) {
                if (data.msg === 'ok') {
                    $scope.user = data.user;
                }
            });

        $scope.save = function() {
            if (!$scope.user) {
                return;
            }
            if ($scope.user.newPassword !== '' && $scope.user.newPassword === $scope.user.confirmPassword) {
                $scope.user.password = $scope.user.newPassword;
            }
            UserService
                .save($scope.user)
                .success(function(data) {
                    $scope.msg = data.msg;
                });
        };
    }]);
angular
    .module('app.user')
    .controller('UserCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle = 'Users';
        $scope.users         = [];

        UserService
            .list()
            .success(function(data) {
                $scope.users = data.users;
            });

        $scope.lock = function(user) {
            UserService
                .lock(user._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        user.locked = !user.locked;
                    }
                });
        };
    }]);
angular
    .module('app.user')
    .controller('UserPasswordCtrl', ['$scope', '$rootScope', 'UserService', function($scope, $rootScope, UserService) {
        $rootScope.pageTitle   = 'Change password';
        $scope.currentPassword = '';
        $scope.newPassword     = '';
        $scope.confirmPassword = '';

        $scope.change = function() {
            if ($scope.currentPassword === '' || $scope.newPassword === '' || $scope.confirmPassword === '' || $scope.newPassword !== $scope.confirmPassword) {
                return;
            }

            UserService
                .changePassword($scope.currentPassword, $scope.newPassword)
                .success(function(data) {
                    $scope.msg = data.msg;
                })
                .error(function(data) {
                });
        };
    }]);
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
angular
    .module('app.user')
    .factory('AuthService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            isAuthenticated: false,

            signin: function(username, password) {
                // Retrieve $http via $injector to prevent circular dependency
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/signin', {
                    username: username,
                    password: password
                });
            },

            signout: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/signout');
            },

            me: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/me');
            }
        };
    }]);
angular
    .module('app.user')
    .factory('TokenInterceptor', ['$rootScope', '$q', '$location', 'AUTH_EVENTS', 'AuthService', function($rootScope, $q, $location, AUTH_EVENTS, AuthService) {
        return {
            response: function(response) {
                if (response !== null && response.status === 200 && !AuthService.isAuthenticated) {
                    AuthService.isAuthenticated = true;
                }
                return response || $q.when(response);
            },

            responseError: function(response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);

                return $q.reject(response);
            }
        };
    }]);
angular
    .module('app.user')
    .factory('UserService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            changePassword: function(currentPassword, newPassword) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/password', {
                    password: currentPassword,
                    new_password: newPassword
                });
            },

            list: function() {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user');
            },

            lock: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/lock', {
                    id: id
                });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/user/get/' + id);
            },

            save: function(user) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/save/' + user._id, user);
            },

            add: function(user) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/user/add', user);
            }
        };
    }]);