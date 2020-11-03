/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpMethodology', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-methodology.html'
		}
	});
