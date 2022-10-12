/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('summaryOfResults', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				immunoprofile: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/immunoprofile/summary-of-results.html'
		}
	});
