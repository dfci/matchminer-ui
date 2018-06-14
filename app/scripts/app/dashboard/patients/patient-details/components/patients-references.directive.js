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

/**
 * Patient oncopanel references section
 */
angular.module('matchminerUiApp')
	.directive('oncopanelReferences', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel-references.html'
		}
	});
