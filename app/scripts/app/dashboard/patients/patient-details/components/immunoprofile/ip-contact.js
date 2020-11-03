/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('immunoprofileContact', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/immunoprofile/immunoprofile-contact.html'
		}
	});
