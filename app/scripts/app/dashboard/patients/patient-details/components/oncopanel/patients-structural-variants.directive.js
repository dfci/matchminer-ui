/**
 * Patient oncopanel structural variants section
 */
angular.module('matchminerUiApp')
	.directive('patientStructuralVariants', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				svMut: '=',
				isEmbedded: '=',
				tooltip: '&',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-structural-variants.html'
		}
	});
