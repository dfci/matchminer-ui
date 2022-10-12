/**
 * Patient oncopanel references section
 */
angular.module('matchminerUiApp')
	.directive('oncopanelReferences', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				isEmbedded: '=',
				ctrl: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-references.html'
		}
	});
