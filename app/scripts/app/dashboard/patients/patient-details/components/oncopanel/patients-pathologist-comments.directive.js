/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('patientPathologistComments', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				tooltip: '&',
				layoutVersion: '=',
				isEmbedded: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-pathologist-comments.html'
		}
	});
