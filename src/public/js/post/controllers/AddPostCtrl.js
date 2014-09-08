angular
    .module('app.post')
    .controller('AddPostCtrl', [
        '$scope', '$rootScope',
        'growlNotifications', 'marked', '$upload',
        'API', 'CategoryService', 'PostService',
        function($scope, $rootScope,
                 growlNotifications, marked, $upload,
                 API, CategoryService, PostService) {
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
                        growlNotifications.add('<strong>' + $scope.post.title + '</strong> is updated', 'success');
                    })
                : PostService
                    .add($scope.post)
                    .success(function(data) {
                        if (data.msg === 'ok') {
                            $scope.mode = 'edit';
                            $scope.post._id = data.id;
                            growlNotifications.add('<strong>' + $scope.post.title + '</strong> is added', 'success');
                        }
                    });
        };
    }]);