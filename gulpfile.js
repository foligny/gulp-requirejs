var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('jshint', function() {
	return gulp.src([
		'*.js',
		'!gulpfile.js',
		'test/**/*.js',
		'!test/fixtures/**/*.js',
	])
	.pipe(jshint())
	.pipe(jshint.reporter(stylish))
})

gulp.task('test', ['jshint'], function() {
	return ;
})