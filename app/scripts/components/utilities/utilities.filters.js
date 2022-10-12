'use strict';

angular.module('matchminerUiApp')
	.filter('capitalize', function () {
		return function (input, scope) {
			if (input != null)
				input = input.toLowerCase().trim();
			if (!!input) {
				return input.substring(0, 1).toUpperCase() + input.substring(1);
			} else {
				return "";
			}
		}
	});

angular.module('matchminerUiApp')
	.filter('parsedate', function () {
		return function (input, scope) {
			if (!!input) {
				var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
				var date = new Date(input);
				return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
			} else {
				return "";
			}
		}
	});

angular.module('matchminerUiApp')
	.filter('parseAlleleFraction', function () {
		return function (input, scope) {
			if (!!input) {
				input = input * 100;
				return parseFloat(input).toFixed(0)+"%";
			} else {
				return "N/A"
			}
		}
	});

angular.module('matchminerUiApp')
	.filter('formatUnderscoreString', function () {
		return function (input) {
			if (!!input) {
				return input.replace(/_/g, " ");
			} else {
				return "";
			}
		}
	});

angular.module('matchminerUiApp')
	.filter('transformNegation', function () {
		return function (input) {
			if (!!input) {
				if (input.charAt(0) == "!") {
					return input.replace(/!/, "NO ");
				} else {
					return input;
				}
			}

			return "";
		}
	});

angular.module('matchminerUiApp')
	.filter('parsecomments', function () {
		var p = new RegExp("/break/");
		return function (input, scope) {
			if (!!input) {
				var secs = input.split('/break//break/');

				var pc_sections = _.map(secs, function (e) {
					if (p.test(e)) {
						return "/break//break/" + e;
					} else {
						return e;
					}
				});

				return pc_sections.map(function (e) {
					if (p.test(e)) {
						return e.replace(/\/break\/\/break\/(.*):\/break\/(.*)/gi, "<h3 class=\'lead report-comment-header\'>$1</h3><p>$2</p>");
					} else {
						return "<h3 class=\'lead report-comment-header\'></h3><p>" + e + "</p>";
					}
				});

			}

		};
	});

// Count number of keys in object by pipe
angular.module('matchminerUiApp')
	.filter('numKeys', function() {
		return function(json) {
			var keys = Object.keys(json);
			return keys.length;
		}
	});
