/**
 * Patients Oncopanel PDF report header
 */
angular.module('matchminerUiApp')
	.directive('patientOncopanelReport', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-pdf-report.html'
		}
	});
