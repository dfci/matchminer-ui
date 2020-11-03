/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpWildtypes', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '=',
				dtOpts: '=',
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-wildtypes.html'
		}
	});
