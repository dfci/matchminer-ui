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

var gulp = require('gulp');
var documentation = require('gulp-documentation');
var path = require('path');
var conf = require('./conf');

gulp.task('documentation', function () {
	gulp.src(path.join(conf.paths.src, '/**/*.js'))
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest(conf.paths.documentation));
});
