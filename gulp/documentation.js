'use strict';

var gulp = require('gulp');
var documentation = require('gulp-documentation');
var path = require('path');
var conf = require('./conf');

gulp.task('documentation', function () {
	gulp.src(path.join(conf.paths.src, '/**/*.js'))
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest(conf.paths.documentation));
});
