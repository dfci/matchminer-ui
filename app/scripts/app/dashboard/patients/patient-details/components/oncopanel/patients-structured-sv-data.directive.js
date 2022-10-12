/**
 * Patient Oncopanel Mutational Signatures
 */
angular.module('matchminerUiApp')
	.directive('patientStructuredSV', function () {
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
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-structured-sv.html'
		}
	});
