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

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('underscore');

var browserSync = require('browser-sync');

gulp.task('inject-reload', ['inject'], function () {
	browserSync.reload();
});

gulp.task('inject', ['scripts', 'styles'], function () {
	var injectStyles = gulp.src([
		path.join(conf.paths.tmp, '/serve/app/**/*.css'),
		path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
	], {read: false});

	var injectScripts = gulp.src([
			path.join(conf.paths.src, '/scripts/**/*.module.js'),
			path.join(conf.paths.src, '/scripts/**/*.js'),
			path.join('!' + conf.paths.src, '/**/*.spec.js'),
			path.join('!' + conf.paths.src, '/**/*.mock.js')
		])
		.pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

	var injectOptions = {
		ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
		addRootSlash: false
	};

	return gulp.src(path.join(conf.paths.src, '/*.html'))
		.pipe($.inject(injectStyles, injectOptions))
		.pipe($.inject(injectScripts, injectOptions))
		.pipe(wiredep(_.extend({}, conf.wiredep)))
		.pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
});
