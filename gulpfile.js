var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var gulpRequirejs = require('./index.js');

gulp.task('manual', function(){
	return gulp.src([
		'modules/**/*.js'
	])
	.pipe(gulpRequirejs({}))
    .pipe(gulp.dest('dist'))
});

gulp.task('jshint', function() {
	return gulp.src([
		'*.js',
		'!gulpfile.js',
		'test/**/*.js',
		'!test/fixtures/**/*.js'
	])
	.pipe(jshint())
	.pipe(jshint.reporter(stylish))
});

gulp.task('test', ['jshint'], function() {
	return true;
});