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
 * Generate a patient CNV table
 */
angular.module('matchminerUiApp')
	.directive('patientCnvGroupedBy', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				category: '=',
				cnvMut: '=',
				isOncologist: '=',
				tooltip: '&',
				dtOpts: '=',
				showFiltersFnc: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/patient-cnv-grouped-by.html'
		}
	});
