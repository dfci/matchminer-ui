'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var less = require('gulp-less');

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

	return gulp.src('./app/styles/*.less')
		.pipe($.sourcemaps.init())
    	.pipe(less({paths: [ path.join(__dirname, 'less', 'includes') ]}))
		.pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')))
		.pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
		.pipe($.sourcemaps.write());
};
