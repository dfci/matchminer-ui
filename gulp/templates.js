'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

/**
 * Template constant tasks
 */
gulp.task('load-templates', function() {
	var templates = require(path.join('..', conf.paths.properties, 'templates.json'));

	return $.ngConstant({
		name: 'matchminer-templates',
		constants: templates,
		stream: true})
		.pipe($.rename('templates.js'))
		.pipe(gulp.dest(path.join(conf.paths.src, 'scripts')));
});

