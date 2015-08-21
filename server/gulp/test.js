var gulp = require('gulp'),
	jasmine = require('gulp-jasmine'),
	config = require('./config.json');

/**
 * Run test once and exit
 */
gulp.task('test', function () {
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
gulp.task('test:auto', ['test'], function () {
	console.log('Watching js files..');

    return gulp.watch(__dirname + config.src + '/**/*.js', ['test']);
});