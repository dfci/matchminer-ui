'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var karma = require('karma');

var pathSrcHtml = [
	path.join(conf.paths.src, '/**/*.html')
];

var pathSrcJs = [
	path.join(conf.paths.src, '/**/!(*.spec).js')
];

function runTests(singleRun, done) {
	var reporters = ['progress', 'dots', 'junit'];
	var preprocessors = {};

	pathSrcHtml.forEach(function (path) {
		preprocessors[path] = ['ng-html2js'];
	});

	if (singleRun) {
		pathSrcJs.forEach(function (path) {
			preprocessors[path] = ['coverage'];
		});
		reporters.push('coverage')
	}

	var localConfig = {
		configFile: path.join(__dirname, '/../karma.conf.js'),
		singleRun: singleRun,
		autoWatch: !singleRun,
		reporters: reporters,
		preprocessors: preprocessors,
    	junitReporter: {
            outputDir: '.',
			useBrowserName: false,
        	outputFile: 'matchminer_ui_test_results.xml'
    	}
	};

	var server = new karma.Server(localConfig, function (failCount) {
		done(failCount ? new Error("Failed " + failCount + " tests.") : null);
	});
	server.start();
}

gulp.task('test', ['config', 'scripts'], function (done) {
	runTests(true, done);
});

gulp.task('test:auto', ['config', 'watch'], function (done) {
	runTests(false, done);
});
