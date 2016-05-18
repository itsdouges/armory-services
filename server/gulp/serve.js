var gulp = require('gulp')
    shell = require('gulp-shell'),
    config = require('./config.json');

/**
 * Start server
 */
gulp.task('serve', shell.task([
  'node ' + __dirname + config.src + '/run'
]));

/**
 * Start server with auto reload and auto test
 */
gulp.task('serve:auto', ['test:auto'], shell.task([
  'nodemon ' + __dirname + config + '/run'
]));