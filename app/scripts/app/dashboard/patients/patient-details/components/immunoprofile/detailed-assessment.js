/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('detailedAssessment', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				immunoprofile: '=',
				dtOpts: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/immunoprofile/detailed-assessment.html'
		}
	});
