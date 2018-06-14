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

angular.module('matchminerUiApp')
	.directive('clinicalTrialBadgeWrap', function() {
		return {
			restrict: "E",
			replace: true,
			scope: {
				isNumber: '=',
				node: '='
			},
			templateUrl: 'scripts/components/partials/criterium-badges.html'
		}
	});