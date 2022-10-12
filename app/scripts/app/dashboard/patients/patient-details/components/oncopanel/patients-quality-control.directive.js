/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('patientQualityControl', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				tooltip: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-quality-control.html'
		}
	});
