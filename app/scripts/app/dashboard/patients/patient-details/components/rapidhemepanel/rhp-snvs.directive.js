/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpSingleVariants', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '=',
				dtOpts: '=',
				snvs: '=',
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-single-variants.html'
		}
	});
