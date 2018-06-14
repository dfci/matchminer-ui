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
	.directive('scrollPosition', function ($window) {
		return {
			scope: {
				scroll: '=scrollPosition'
			},
			link: function (scope, element, attrs) {
				var windowEl = angular.element($window);
				var handler = function () {
					scope.scroll = windowEl.scrollTop();
				};
				windowEl.on('scroll', scope.$apply.bind(scope, handler));
				handler();
			}
		};
	});
