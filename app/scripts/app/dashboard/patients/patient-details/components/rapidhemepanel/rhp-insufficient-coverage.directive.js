/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpInsufficientCodonCoverage', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				ctrl: '=',
				dtOpts: '=',
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-insufficient-codon-coverage.html'
		}
	});
