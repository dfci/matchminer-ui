/**
 * Generate a tiered variants table
 */
angular.module('matchminerUiApp')
	.directive('patientDnaTieredVariants', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				category: '=',
				tieredVariants: '=',
				tooltip: '&',
				pmTooltip: '&',
				isOncologist: '=',
				dtOpts: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/dna-variants.html'
		}
	});
