var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var ngConstant = require('gulp-ng-constant');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var fs = require('fs');

gulp.task('config', function () {
	var config = JSON.parse(fs.readFileSync(path.join(conf.paths.properties, 'config.json')));
	var environment = gutil.env.env ? gutil.env.env : 'dev';
	return ngConstant({
		name: "matchminerUiApp",
		constants: config[environment],
		deps: false,
		stream: true
	})
		.pipe(rename('config.js'))
		.pipe(gulp.dest(path.join(conf.paths.src, 'scripts')));
});

