const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const config = require('./config.json');
const runSequence = require('run-sequence');

/**
 * Run all tests
 */
gulp.task('test', (cb) => {
  runSequence(
    'test:unit',
    'test:int',
    cb
  );
});

/**
 * Run test once and exit
 */
gulp.task('test:unit', () =>
  gulp.src([
    `${__dirname}${config.src}/**/*.spec.js`,
  ])
  .pipe(jasmine({
    includeStackTrace: true,
  })));

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('test:unit:auto', ['test:unit'], () => {
  console.log('\n== Watching js files.. ==\n');
  return gulp.watch(`${__dirname}${config.src}/**/*.js`, ['test:unit']);
});

/**
 * Run test once and exit
 */
gulp.task('test:int', () =>
  gulp.src([
    `${__dirname}${config.src}/**/*.int.js`,
  ])
  .pipe(jasmine({
    includeStackTrace: true,
  })));

