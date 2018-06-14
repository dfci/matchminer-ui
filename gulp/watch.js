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

function isOnlyChange(event) {
	return event.type === 'changed';
}

gulp.task('watch', ['inject'], function () {

	gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], ['inject-reload']);

	gulp.watch([
		path.join(conf.paths.src, '/styles/**/*.css'),
		path.join(conf.paths.src, '/styles/**/*.less')
	], function (event) {
		if (isOnlyChange(event)) {
			gulp.start('styles-reload');
		} else {
			gulp.start('inject-reload');
		}
	});

	gulp.watch(path.join(conf.paths.src, '/scripts/**/*.js'), function (event) {
		if (isOnlyChange(event)) {
			gulp.start('scripts-reload');
		} else {
			gulp.start('inject-reload');
		}
	});

	gulp.watch(path.join(conf.paths.src, '/scripts/**/*.html'), function (event) {
		browserSync.reload(event.path);
	});
});
