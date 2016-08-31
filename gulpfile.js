var gulp = require('gulp');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var wrap = require('gulp-wrap');

var files = [
  'src/lib/trim.js',
  'src/lib/check-number.js',
  'src/lib/check-phone.js',
  'src/lib/format-phone.js',
  'src/lib/generate.js',
  'src/lib/is-date.js',
  'src/lib/is-email.js',
  'src/lib/engine.js',
  'src/util-validator.js',
  'src/services/validate.js',
  'src/directives/validate.js',
];

var lintFiles = files;

var licenses = [
  'src/LICENSE.txt'
];

gulp.task('lint', function () {
  return gulp.src(lintFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('license', function() {
  return gulp.src(licenses)
    .pipe(insert.transform(function(contents, file) {
      return 'File: ' + file.path.replace(__dirname, '') + "\n" + contents;
    }))
    .pipe(concat('LICENSE.txt'))
    .pipe(gulp.dest(''));
});

var packageJson = require('./package.json');
gulp.task('scripts', function() {
  return gulp.src(files)
    .pipe(concat('util-validator.js'))
    .pipe(wrap({src: 'src/template.txt'}, {version: packageJson.version}, {variable: 'data'}))
    .pipe(gulp.dest('dist/'))
    .pipe(rename('util-validator.min.js'))
    .pipe(uglify({preserveComments: 'license'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['lint', 'scripts', 'license']);
gulp.task('default', ['build']);