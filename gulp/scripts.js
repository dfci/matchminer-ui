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


gulp.task('scripts-reload', function () {
	return buildScripts()
		.pipe(browserSync.stream());
});

gulp.task('scripts', function () {
	return buildScripts();
});

function buildScripts() {
	return gulp.src(path.join(conf.paths.src, '/scripts/**/*.js'))
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.size())
};
