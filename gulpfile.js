var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var deflist = require('markdown-it-deflist');
var terms = require('markdown-it-special-terms');
var del = require('del');
var shell = require('gulp-shell');
var count = require('gulp-count-stat');

var md = new MarkdownIt({
   html: true,
   xhtmlOut: true,
   breaks: true,
   typographer: true
   // linkify: true
});


md.use(deflist);
md.use(terms);


gulp.task('clean', function () {
   return del('html/**');
});

gulp.task('build', ['clean'], function () {
   return gulp.src(['**/*.md', '!node_modules/**'])
      .pipe(tap((file) => {
         var result = md.render(file.contents.toString());
         file.contents = new Buffer(result);
         file.path = gutil.replaceExtension(file.path, '.html');
         return;
      }))
      .pipe(gulp.dest('./html'));
});

gulp.task('spelling', function () {
   return gulp.src(['**/*.md', '!node_modules/**'])
      .pipe(shell(['echo "<%= file.path %>"', 'OddSpell "<%= file.path %>"']));
});

gulp.task('count', function () {
   return gulp.src(['**/*.md', '!node_modules/**'])
      .pipe(count());
});

