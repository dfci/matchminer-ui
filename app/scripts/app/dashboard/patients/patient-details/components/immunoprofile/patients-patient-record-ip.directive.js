/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('patientRecordIp', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				immunoprofile: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/immunoprofile/immunoprofile-patient-record.html'
		}
	});
