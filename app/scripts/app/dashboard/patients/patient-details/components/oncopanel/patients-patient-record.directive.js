/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('patientRecord', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				oncotreeLink: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-patient-record.html'
		}
	});
