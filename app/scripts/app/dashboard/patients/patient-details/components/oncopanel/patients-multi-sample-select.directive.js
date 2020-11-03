/**
 * Patient oncopanel multi sample select
 */
angular.module('matchminerUiApp')
	.directive('patientMultiSampleSelect', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/patient-multi-sample-select.html'
		}
	});
