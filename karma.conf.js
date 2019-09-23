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
var conf = require('./gulp/conf');
var wiredep = require('wiredep');
var _ = require('underscore');

var pathSrcHtml = [
	path.join(conf.paths.src, '/**/*.html')
];

function listFiles() {
	var wiredepOptions = _.extend({}, conf.wiredep, {
		dependencies: true,
		devDependencies: true
	});

	var patterns = wiredep(wiredepOptions).js
		.concat([
			path.join(conf.paths.src, '/**/*.module.js'),
			path.join(conf.paths.src, '/**/*.js'),
			path.join(conf.paths.src, '/**/*.spec.js'),
			path.join(conf.paths.src, '/**/*.mock.js')
		])
		.concat(pathSrcHtml);

	var files = patterns.map(function (pattern) {
		return {
			pattern: pattern
		};
	});
	files.push({
		pattern: path.join(conf.paths.src, '/assets/**/*'),
		included: false,
		served: true,
		watched: false
	});
	return files;
}

module.exports = function (config) {

	var configuration = {
		files: listFiles(),

		singleRun: true,

		autoWatch: false,

		logLevel: 'INFO',

		frameworks: ['phantomjs-shim', 'jasmine', 'angular-filesort'],

		angularFilesort: {
			whitelist: [path.join(conf.paths.src, '/**/!(*.html|*.spec|*.mock).js')]
		},

		browsers: ['PhantomJS'],

		plugins: [
			'karma-phantomjs-launcher',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-safari-launcher',
			'karma-angular-filesort',
			'karma-phantomjs-shim',
			'karma-coverage',
			'karma-jasmine',
            'karma-junit-reporter',
			'karma-ng-html2js-preprocessor'
		],

		ngHtml2JsPreprocessor: {
			stripPrefix: 'app/',
			moduleName: 'html.templates'
		},

		coverageReporter: {
			reporters: [
				// good old fashioned html
				{type: 'html', subdir: '.'},
				// generates ./coverage/lcov.info
				{type: 'lcovonly', subdir: '.'},
				// generates ./coverage/coverage-final.json
				{type: 'json', subdir: '.'}
			]
		},

		reporters: ['coverage'],

		proxies: {
			'/assets/': path.join('/base/', conf.paths.src, '/assets/')
		}
	};

	// This is the default preprocessors configuration for a usage with Karma cli
	// The coverage preprocessor is added in gulp/unit-test.js only for single tests
	// It was not possible to do it there because karma doesn't let us now if we are
	// running a single test or not
	configuration.preprocessors = {
		// source files, that you wanna generate coverage for
		// do not include tests or libraries
		// (these files will be instrumented by Istanbul)
		'src/**/*.js': ['coverage'],
		'app/**/*.html': ['ng-html2js']
	};

	config.set(configuration);
};
