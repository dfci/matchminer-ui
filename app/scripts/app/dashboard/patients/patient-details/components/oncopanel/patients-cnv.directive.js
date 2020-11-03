/**
 * Generate a patient CNV table
 */
angular.module('matchminerUiApp')
	.directive('patientCnv', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				cnvMut: '=',
				isOncologist: '=',
				tooltip: '&',
				dtOpts: '=',
				isEmbedded: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/patient-cnv.html'
		}
	});
