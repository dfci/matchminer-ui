/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpPatientQualityControl', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/quality-control.html'
		}
	});
