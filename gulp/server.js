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
var browserSyncSpa = require('browser-sync-spa');
var util = require('util');
var gutil = require('gulp-util');
var https = require('https');
var modRewrite = require('connect-modrewrite');
var fs = require('fs');
var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'uglify-save-license', 'del']
});

var proxy = require('http-proxy-middleware');

function browserSyncInit(baseDir, browser) {
	browser = browser === undefined ? 'default' : browser;

	var routes = null;
	if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
		routes = {
			'/bower_components': 'bower_components'
		};
	}
	var config = require(path.join('..', conf.paths.properties, 'config.json'));
	var environment = gutil.env.env ? gutil.env.env : 'dev';
    var agent = environment === 'dev' ? null : https.globalAgent;

	var matchMinerProxy = proxy('/api', {
		target: config[environment].ENV.api.host,
		changeOrigin: true,
		logLevel: 'debug',
		agent: agent,
		secure: true,
		https: true,
		ssl: {
			key: fs.readFileSync(config[environment].ENV.certificate.key, 'utf8'),
			cert: fs.readFileSync(config[environment].ENV.certificate.cert, 'utf8')
		}
	});

	var elasticSearchProxy = proxy('/elasticsearch', {
		target: config[environment].ENV.elasticsearch.host,
		logLevel: 'debug',
		pathRewrite: {
			'^/elasticsearch' : ''       // remove path
		}
	});

	var server = {
		baseDir: baseDir,
		routes: routes,
		middleware: [
			modRewrite([
				'!\\.\\w+$ /index.html [L]'
			]),
			elasticSearchProxy,
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
