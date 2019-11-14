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
				return Date.parse(input);
			} else {
				return "";
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
