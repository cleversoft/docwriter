angular.module('app.admin',    []);
angular.module('app.category', []);
angular.module('app.post',     ['ngSanitize']);
angular.module('app.user',     []);

angular
    .module('app', [
        'ngRoute',
        'angular-loading-bar',
        'angularFileUpload',
        'angularMoment',
        'btford.socket-io',
        'growlNotifications',
        'ui.bootstrap',
        'ui.codemirror',
        'ui.gravatar',

        // App mofules
        'app.admin',
        'app.category',
        'app.post',
        'app.user'
    ])
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
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider

            // admin module
            .when('/admin', {
                templateUrl: '/js/admin/views/dashboard.html',
                controller: 'DashboardCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // category module
            .when('/admin/category', {
                templateUrl: '/js/category/views/index.html',
                controller: 'CategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/category/add', {
                templateUrl: '/js/category/views/add.html',
                controller: 'AddCategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/category/edit/:id', {
                templateUrl: '/js/category/views/edit.html',
                controller: 'EditCategoryCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // post module
            .when('/admin/post', {
                templateUrl: '/js/post/views/index.html',
                controller: 'PostCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/post/edit/:id', {
                templateUrl: '/js/post/views/edit.html',
                controller: 'EditPostCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/post/add', {
                templateUrl: '/js/post/views/add.html',
                controller: 'AddPostCtrl',
                data: {
                    requiredAuthentication: true
                }
            })

            // user module
            .when('/admin/user', {
                templateUrl: '/js/user/views/index.html',
                controller: 'UserCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/user/password', {
                templateUrl: '/js/user/views/password.html',
                controller: 'UserPasswordCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/user/add', {
                templateUrl: '/js/user/views/add.html',
                controller: 'AddUserCtrl',
                data: {
                    requiredAuthentication: true
                }
            })
            .when('/admin/user/edit/:id', {
                templateUrl: '/js/user/views/edit.html',
                controller: 'EditUserCtrl',
                data: {
                    requiredAuthentication: true
                }
            });

        $locationProvider.html5Mode(true);
    }])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('TokenInterceptor');
    }])
    .factory('socket', function(socketFactory) {
        return socketFactory();
    })
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
    .module('app.admin')
    .filter('urlBuilder', ['$window', '$location', function($window, $location) {
        return function(input, params, excludedParams) {
            var urlParams = {};
            angular.extend(urlParams, $location.search());

            for (var k in params) {
                urlParams[k] = params[k];
            }
            if (excludedParams) {
                for (k in excludedParams) {
                    delete urlParams[excludedParams[k]];
                }
            }

            // Remove empty params
            var numParams = 0;
            for (k in urlParams) {
                numParams++;
                if (!urlParams[k]) {
                    numParams--;
                    delete urlParams[k];
                }
            }

            var arr = [];
            for (k in urlParams) {
                arr.push(k + '=' + urlParams[k]);
                //arr.push(k + '=' + decodeURIComponent(urlParams[k]));
            }

            return (numParams == 0) ? input : input + '?' + arr.join('&');
        };
    }]);
angular
    .module('app.category')
    .controller('AddCategoryCtrl', ['$scope', '$rootScope', 'growlNotifications', 'CategoryService', function($scope, $rootScope, growlNotifications, CategoryService) {
        $rootScope.pageTitle = 'Add new category';
        $scope.category      = null;
        $scope.msg           = null;

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
                    $scope.msg = data.msg === 'ok' ? null : data.msg;
                    if (data.msg === 'ok') {
                        growlNotifications.add('<strong>' + $scope.category.name + '</strong> is added', 'success');
                        $scope.category = null;
                    }
                });
        };
    }]);
angular
    .module('app.category')
    .controller('CategoryCtrl', ['$scope', '$rootScope', '_', 'growlNotifications', '$modal', 'CategoryService', function($scope, $rootScope, _, growlNotifications, $modal, CategoryService) {
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
                                growlNotifications.add('<strong>' + selected.name + '</strong> is removed', 'success');
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
    .controller('EditCategoryCtrl', ['$scope', '$rootScope', '$routeParams', 'growlNotifications', 'CategoryService', function($scope, $rootScope, $routeParams, growlNotifications, CategoryService) {
        $rootScope.pageTitle = 'Edit the category';
        $scope.category      = null;
        $scope.msg           = null;

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
                    $scope.msg = data.msg === 'ok' ? null : data.msg;
                    if (data.msg === 'ok') {
                        growlNotifications.add('<strong>' + $scope.category.name + '</strong> is updated', 'success');
                    }
                });
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
    .module('app.post')
    .controller('AddPostCtrl', ['$scope', '$rootScope', 'marked', '$upload', 'API', 'CategoryService', 'PostService', function($scope, $rootScope, marked, $upload, API, CategoryService, PostService) {
        $rootScope.pageTitle = 'Add new post';
        $scope.categories    = [];
        $scope.post          = {
            id: null,
            categories: [],
            heading_styles: 'none'
        };
        $scope.mode          = 'add';
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

        $scope.selectCategory = function(id) {
            var index = $scope.post.categories.indexOf(id);
            (index > -1)
                ? $scope.post.categories.splice(index, 1)
                : $scope.post.categories.push(id);
        };

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

        $scope.save = function(status) {
            if (!$scope.post.title || !$scope.post.slug || !$scope.post.content) {
                return;
            }
            if (status) {
                $scope.post.status = status;
            }

            $scope.post._id
                ? PostService
                    .save($scope.post)
                    .success(function(data) {
                        $scope.mode = 'edit';
                    })
                : PostService
                    .add($scope.post)
                    .success(function(data) {
                        if (data.msg === 'ok') {
                            $scope.mode = 'edit';
                            $scope.post._id = data.id;
                        }
                    });
        };
    }]);
angular
    .module('app.post')
    .controller('EditPostCtrl', ['$scope', '$rootScope', '$compile', '$routeParams', 'marked', '$upload', 'API', 'CategoryService', 'PostService', function($scope, $rootScope, $compile, $routeParams, marked, $upload, API, CategoryService, PostService) {
        $rootScope.pageTitle = 'Edit post';
        $scope.categories    = [];
        $scope.post          = {
            categories: [],
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

        $scope.activeContentTab = true;

        PostService
            .get($routeParams.id)
            .success(function(data) {
                if (data.msg === 'ok') {
                    $scope.post = data.post;
                    if ($scope.editor) {
                        $scope.editor.getDoc().setValue($scope.post.content);
                    }

                    if (['______', '111111', 'AAAAAA', 'aaaaaa', 'IIIIII', 'iiiiii'].indexOf($scope.post.heading_styles) === -1) {
                        for (var i = 0; i < 6; i++) {
                            $scope.post['heading_style_h' + String(i + 1)] = $scope.post.heading_styles.charAt(i);
                        }
                        $scope.post.heading_styles = 'custom';
                    }

                }
            })
            .then(function() {
                return CategoryService.list();
            })
            .then(function(response) {
                if ($scope.post.categories) {
                    $scope.categories = response.data.categories;

                    for (var i = 0; i < $scope.categories.length; i++) {
                        if ($scope.post.categories.indexOf($scope.categories[i]._id) > -1) {
                            $scope.categories[i].selected = true;
                        }
                    }
                }
            });

        $scope.selectCategory = function(id) {
            var index = $scope.post.categories.indexOf(id);
            (index > -1)
                ? $scope.post.categories.splice(index, 1)
                : $scope.post.categories.push(id);
        };

        $scope.editorLoaded = function(editor) {
            $scope.editor = editor;

            editor.on('change', function(instance) {
                // Simple hack to set the content
                // If I set ng-model="post.content" for the editor, I can't insert data to it
                // via $scope.editor.getDoc().replaceSelection(...);
                $scope.post.content = instance.getValue();
            });
        };

        var renderer = new marked.Renderer();
        renderer.heading = function(text, level) {
            // I don't want to include an auto-generated ID of heading
            return '<h' + level + '>' + text + '</h' + level + '>';
        };
        renderer.image = function(href, title, text) {
            var out = '<img note-image src="' + href + '" alt="' + text + '"';
            if (title) {
                out += ' title="' + title + '"';
            }
            out += '/>';
            return out;
        };

        $scope.preview = function() {
            $scope.html = marked($scope.post.content || '', {
                renderer: renderer
            });

            $compile($scope.html)($scope);
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

        $scope.save = function(status) {
            if (!$scope.post.title || !$scope.post.slug || !$scope.post.content) {
                return;
            }
            if (status) {
                $scope.post.status = status;
            }

            PostService
                .save($scope.post)
                .success(function(data) {
                });
        };
    }]);
angular
    .module('app.post')
    .controller('PostCtrl', ['$scope', '$rootScope', '$location', '_', 'growlNotifications', '$modal', 'socket', 'PostService', function($scope, $rootScope, $location, _, growlNotifications, $modal, socket, PostService) {
        $rootScope.pageTitle = 'Posts';
        $scope.posts         = [];

        var qs = $location.search();
        $scope.criteria = {
            page: qs.page || 1,
            keyword: qs.q || null,
            status: qs.status || null
        };

        $scope.pagination = {
            total_items: 0,
            per_page: 10,
            current_page: 1,
            num_pages: 1
        };

        PostService
            .list($scope.criteria)
            .success(function(data) {
                $scope.posts      = data.posts;
                $scope.pagination = data.pagination;
            });

        // Init the socket
        socket.on('connect', function() {
            socket.on('/job/exportPdf/started', function(data) {

            });

            socket.on('/jobs/exportPdf/done', function(data) {
                var post = _.find($scope.posts, function(p) {
                    return p._id + '' === data.post_id;
                });
                if (post) {
                    post.pdf.status   = 'done';
                    post.pdf.username = data.username;
                    post.pdf.email    = data.email;
                    post.pdf.date     = data.date;
                }
            });
        });

        $scope.search = function() {
            $location.search({
                q: $scope.criteria.keyword
            });
        };

        $scope.filter = function(status) {
            $location.search('page', '1');
            $location.search('status', status || null);
        };

        /**
         * Go to other page
         */
        $scope.jump = function() {
            $location.search('page', $scope.pagination.current_page + '');
        };

        /**
         * Duplicate post
         */
        $scope.duplicate = function(post) {
            PostService
                .duplicate(post._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        $scope.posts.push(data.post);
                        growlNotifications.add('<strong>' + post.title + '</strong> is duplicated', 'success');
                    }
                });
        };

        $scope.confirm = function(post) {
            $scope.selected = post;

            // Show the modal
            $modal
                .open({
                    templateUrl: 'removePostModal.html',
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
                            return post;
                        }
                    }
                })
                .result
                .then(function(selected) {
                    PostService
                        .remove(selected._id)
                        .success(function(data) {
                            if (data.msg === 'ok') {
                                // Remove from the collections
                                _.remove($scope.posts, function(item) {
                                    return item._id === selected._id;
                                });

                                growlNotifications.add('<strong>' + selected.title + '</strong> is removed', 'success');
                            }
                        });
                }, function() {
                });
        };

        $scope.publish = function(post) {
            PostService
                .activate(post._id)
                .success(function(data) {
                    if (data.msg === 'ok') {
                        post.status = (post.status === 'activated') ? 'deactivated' : 'activated';
                        growlNotifications.add('<strong>' + post.title + '</strong> is ' + (post.status === 'deactivated' ? 'unpublished' : 'published'), 'success');
                    }
                });
        };

        /**
         * Export to PDF
         */
        $scope.exportPdf = function(post) {
            socket.emit('/job/exportPdf/starting', {
                id: post._id,
                user: $scope.currentUser.username
            });

            PostService
                .exportPdf(post._id)
                .success(function(data) {

                });
        };
    }]);
angular
    .module('app.post')
    .directive('noteImage', function() {
        return {
            restrict: 'A',
            link: function(scope, ele, attrs) {

            }
        };
    });
angular
    .module('app.post')
    .directive('postSlug', ['PostService', function(PostService) {
        return {
            restrict: 'A',
            scope: {
                postTitle: '=',
                postId: '=',
                ngModel: '='
            },
            link: function(scope, ele, attrs) {
                scope.$watch('postTitle', function(val) {
                    if (!val) {
                        scope.ngModel = '';
                        return;
                    }
                    PostService
                        .generateSlug(val, scope.postId)
                        .success(function(data) {
                            scope.ngModel = data.slug;
                        });
                });
            }
        };
    }]);
angular
    .module('app.post')
    .factory('PostService', ['$injector', 'API', function($injector, API) {
        var $http;
        return {
            activate: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/activate/' + id);
            },

            add: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/add', post);
            },

            duplicate: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/duplicate/' + id);
            },

            exportPdf: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/pdf/export/' + id);
            },

            generateSlug: function(title, id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/slug', { title: title, id: id });
            },

            get: function(id) {
                $http = $http || $injector.get('$http');
                return $http.get(API.baseUrl + '/post/get/' + id);
            },

            list: function(criteria) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post', criteria);
            },

            remove: function(id) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/remove', {
                    id: id
                });
            },

            save: function(post) {
                $http = $http || $injector.get('$http');
                return $http.post(API.baseUrl + '/post/save/' + post._id, post);
            }
        };
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