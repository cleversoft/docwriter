var gulp   = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    paths  = {
        scripts: ['public/js/**/*.js']
    };

gulp.task('build', function() {
    return gulp.src(paths.scripts)
               //.pipe(uglify()).pipe(concat('backend.min.js'))
               .pipe(concat('backend.js'))
               .pipe(gulp.dest('public/dist/js'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['build']);
});

gulp.task('default', ['watch', 'build']);