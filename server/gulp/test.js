var gulp = require('gulp'),
	jasmine = require('gulp-jasmine'),
	config = require('./config.json');

/**
 * Run test once and exit
 */
gulp.task('test:unit', function () {
	return gulp.src([
			__dirname + config.src + '/**/*.spec.js'
		])
		.pipe(jasmine({
			includeStackTrace: true
		}));
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('test:unit:auto', ['test:unit'], function () {
	console.log('Watching js files..');

    return gulp.watch(__dirname + config.src + '/**/*.js', ['test:unit']);
});

/**
 * Run test once and exit
 */
gulp.task('test:int', function () {
	return gulp.src([
			__dirname + config.src + '/**/*.int.js'
		])
		.pipe(jasmine({
			includeStackTrace: true
		}));
});