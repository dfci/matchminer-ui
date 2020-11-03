/**
 * Patient oncopanel references section
 */
angular.module('matchminerUiApp')
	.directive('patientVitalStatus', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				ctrl: '<'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/patient-vital-status.html'
		}
	});
