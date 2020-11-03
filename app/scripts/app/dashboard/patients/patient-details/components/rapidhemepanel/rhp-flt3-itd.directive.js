/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpFlt3Itd', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '=',
				dtOpts: '=',
				flt3: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-flt3-itd.html'
		}
	});
