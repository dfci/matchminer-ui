/**
 * Patient oncopanel methodology section
 */
angular.module('matchminerUiApp')
	.directive('oncopanelMethodology', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-methodology.html'
		}
	});
