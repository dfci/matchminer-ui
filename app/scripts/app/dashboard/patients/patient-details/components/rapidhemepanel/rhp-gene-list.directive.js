/**
 * Patient oncopanel quality control section
 */
angular.module('matchminerUiApp')
	.directive('rhpGeneList', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				ctrl: '=',
				dtOpts: '=',
				genePanel: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/rhp/rhp-gene-list.html'
		}
	});
