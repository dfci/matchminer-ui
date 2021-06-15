/**
 * Patient oncopanel references section
 */
angular.module('matchminerUiApp')
	.directive('patientNotMatched', function () {
		return {
			restrict: "E",
			scope: {
				clinical: '=',
				ctrl: '<'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/patient-not-matched.html'
		}
	});
