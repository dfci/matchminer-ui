'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var debug = require('gulp-debug');
var lazypipe = require('lazypipe');
var filter = require('gulp-filter');
var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
	return gulp.src(path.join(conf.paths.src, '/scripts/**/*.html'))
		.pipe($.order([]))
		.pipe($.htmlmin({
			removeEmptyAttributes: false,
			removeAttributeQuotes: false,
			collapseBooleanAttributes: true,
			collapseWhitespace: true
		}))
		.pipe($.angularTemplatecache('templateCacheHtml.js', {
			module: 'matchminerUiApp',
			root: 'scripts'
		}))
		.pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
	var partialsInjectFile = gulp.src(
		path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), {read: false}
	);
	var partialsInjectOptions = {
		starttag: '<!-- inject:partials -->',
		ignorePath: path.join(conf.paths.tmp, '/partials'),
		addRootSlash: false
	};

	var htmlFilter = $.filter('*.html', {restore: true});
	var jsFilter = $.filter('**/*.js', {restore: true});
	var cssFilter = $.filter('**/*.css', {restore: true});
    var vendorFilter = filter(['**', '!*vendor'], {restore: true});

	return gulp.src(path.join(conf.paths.tmp, '/serve/index.html'))
		.pipe($.inject(partialsInjectFile, partialsInjectOptions))
		.pipe($.useref({searchPath: ['.tmp', 'app']}, lazypipe().pipe($.sourcemaps.init, {loadMaps: true})))
		.pipe(jsFilter)
		.pipe(debug({title: 'Processing: ' }))
		.pipe($.ngAnnotate())
		.pipe($.uglify({preserveComments: $.uglifySaveLicense})).on('error', conf.errorHandler('Uglify'))
		.pipe($.rev())
		.pipe(vendorFilter)
        .pipe($.sourcemaps.write('maps'))
		.pipe(jsFilter.restore)
        .pipe(vendorFilter.restore)
		.pipe(cssFilter)
		.pipe($.sourcemaps.init())
		//.pipe($.cssnano({
		//	safe: true
		//}))
		.pipe($.rev())
		.pipe($.sourcemaps.write('maps'))
		.pipe(cssFilter.restore)
		.pipe($.revReplace())
		.pipe(htmlFilter)
		.pipe($.htmlmin({
			removeEmptyAttributes: true,
			removeAttributeQuotes: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true
		}))
		.pipe(htmlFilter.restore)
		.pipe(gulp.dest(path.join(conf.paths.dist, '/')))
		.pipe($.size({title: path.join(conf.paths.dist, '/'), showFiles: true}));
});

gulp.task('other', function () {
	var fileFilter = $.filter(function (file) {
		return file.stat.isFile();
	});

	return gulp.src([
			path.join(conf.paths.src, '/**/*'),
			path.join('!' + conf.paths.src, '/**/*.{html,css,js,less}')
		])
		.pipe(fileFilter)
		.pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('clean', function () {
	return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['config', 'load-templates', 'html', 'other']);

gulp.task('build-docker', [ 'load-templates', 'html', 'other']);
