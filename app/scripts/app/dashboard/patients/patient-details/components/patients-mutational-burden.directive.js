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
 * Patient Oncopanel Mutational Burden section
 */
angular.module('matchminerUiApp')
	.directive('patientMutationalBurden', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				tooltip: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel-mutational-burden.html'
		}
	});

/**
 * The CANCER_TYPE_PERCENTILE box
 */
angular.module('matchminerUiApp')
    .directive('patientMutationalBurdenCancerTypePercentileBox', function() {
        return {
            restrict: "E",
            link: function(scope, element, attrs) {
                scope.$watch(function(){
                    scope.style = {
                        height:element[0].offsetHeight+'px'
                    };
                });
            }
        }
    });
