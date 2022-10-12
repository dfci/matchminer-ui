/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('immunoprofileMethodology', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/immunoprofile/immunoprofile-methodology.html'
		}
	});
