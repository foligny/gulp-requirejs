var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var mocha = require('gulp-mocha');
var gulpRequirejs = require('./index.js');

gulp.task('jshint', function() {
	return gulp.src([
		'index.js',
		'src/*.js',
		'test/main.js'
	])
	.pipe(jshint())
	.pipe(jshint.reporter(stylish))
});

gulp.task('test', ['jshint'], function() {
    return gulp.src('test/main.js', {read: false})
        .pipe(mocha());
});