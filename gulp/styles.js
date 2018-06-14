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

var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('styles-reload', ['styles'], function () {
	return buildStyles()
		.pipe(browserSync.stream());
});

gulp.task('styles', function () {
	return buildStyles();
});

var buildStyles = function () {
	var lessOptions = {
		paths: [
			'bower_components',
			path.join(conf.paths.src, '/styles')
		],
		relativeUrls: true
	};

	var injectFiles = gulp.src([
		path.join(conf.paths.src, '/styles/*.less'),
		path.join('!' + conf.paths.src, '/matchminer.less')
	], {read: false});

	var injectOptions = {
		transform: function (filePath) {
			filePath = filePath.replace(conf.paths.src + '/styles/', '');
			return '@import "' + filePath + '";';
		},
		starttag: '// injector',
		endtag: '// endinjector',
		addRootSlash: false
	};


	return gulp.src([
			path.join(conf.paths.src, '/matchminer.less')
		])
		.pipe($.inject(injectFiles, injectOptions))
		.pipe(wiredep(_.extend({}, conf.wiredep)))
		.pipe($.sourcemaps.init())
		.pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
		.pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
};
