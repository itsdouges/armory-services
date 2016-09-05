const gulp = require('gulp');
const shell = require('gulp-shell');
const config = require('./config.json');

/**
 * Start server
 */
gulp.task('serve', shell.task([
  `node ${__dirname}${config.src}/run`,
]));

/**
 * Start server with auto reload and auto test
 */
gulp.task('serve:auto', ['test:auto'], shell.task([
  `nodemon ${__dirname}${config.src}/run`,
]));
