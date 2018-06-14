/*
 * Copyright (c) 2017. Dana-Farber Cancer Institute. All rights reserved.
 *
 *  Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *
 * See the file LICENSE in the root of this repository.
 *
 * Contributing authors:
 * - berndvdveen
 *
 */

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

