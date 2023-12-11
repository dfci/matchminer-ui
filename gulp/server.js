'use strict';

var path = require('path');
var process = require('process');
var gulp = require('gulp');
var conf = require('./conf');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var util = require('util');
var gutil = require('gulp-util');
var https = require('https');
var modRewrite = require('connect-modrewrite');
var fs = require('fs');
var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'uglify-save-license', 'del']
});

const { createProxyMiddleware } = require('http-proxy-middleware');

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:5000';
// Note: newer Node versions seem to break when you specify "localhost" above,
// apparently due to IPv6 issues.

function browserSyncInit(baseDir, browser) {
	browser = browser === undefined ? 'google chrome' : browser;

	var routes = null;
	if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
		routes = {
			'/bower_components': 'bower_components'
		};
	}
	var backendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

	var matchMinerProxy = createProxyMiddleware('/api', {
		target: backendUrl,
		logLevel: 'debug'
	});

	var server = {
		baseDir: baseDir,
		routes: routes,
		middleware: [
			modRewrite([
				'!\\.\\w+$ /index.html [L]'
			]),
			matchMinerProxy
		]
	};

	/*
	 * You can add a proxy to your backend by uncommenting the line below.
	 * You just have to configure a context which will we redirected and the target url.
	 * Example: $http.get('/users') requests will be automatically proxified.
	 *
	 * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.9.0/README.md
	 *
	 * Bernd: Only use `changeOrigin: true` when a namebased address (non-IP) is used.
	 */
	browserSync.instance = browserSync.init({
		startPath: '/',
		server: server,
		browser: browser,
		port: 8001,
		ghostMode: false
	});
}

browserSync.use(browserSyncSpa({
	selector: '[ng-app]'// Only needed for angular apps
}));

gulp.task('serve', ['config', 'load-templates', 'watch'], function () {
	browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
});

gulp.task('serve:dist', ['build'], function () {
	browserSyncInit(conf.paths.dist);
});

gulp.task('serve:e2e', ['inject'], function () {
	browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src], []);
});

gulp.task('serve:e2e-dist', ['build'], function () {
	browserSyncInit(conf.paths.dist, []);
});
