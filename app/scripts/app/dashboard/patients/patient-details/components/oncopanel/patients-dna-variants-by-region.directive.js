/**
 * Generate a tiered variants table
 */
angular.module('matchminerUiApp')
	.directive('patientDnaVariantsByRegion', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				category: '=',
				variants: '=',
				dtOpts: '=',
				ngTooltip: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/dna-variants-by-region.html'
		}
	});
