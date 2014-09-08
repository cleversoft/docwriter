angular
    .module('app.post')
    .controller('EditPostCtrl', [
        '$scope', '$rootScope', '$compile', '$routeParams',
        'growlNotifications', 'marked', '$upload',
        'API', 'CategoryService', 'PostService',
        function($scope, $rootScope, $compile, $routeParams,
                 growlNotifications, marked, $upload,
                 API, CategoryService, PostService) {
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
                    growlNotifications.add('<strong>' + $scope.post.title + '</strong> is updated', 'success');
                });
        };
    }]);