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

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var ngConstant = require('gulp-ng-constant');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

gulp.task('config', function () {
	var config = require(path.join('..', conf.paths.properties, 'config.json'));
	var environment = gutil.env.env ? gutil.env.env : 'dev';
	return ngConstant({
		name: "matchminerUiApp",
		constants: config[environment],
		deps: false,
		stream: true
	})
		.pipe(rename('config.js'))
		.pipe(gulp.dest(path.join(conf.paths.src, 'scripts')));
});

