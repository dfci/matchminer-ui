/**
 * Generate a patient CNV table
 */
angular.module('matchminerUiApp')
	.directive('patientCnvGroupedBy', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				category: '=',
				cnvMut: '=',
				isOncologist: '=',
				tooltip: '&',
				dtOpts: '=',
				showFiltersFnc: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/patient-cnv-grouped-by.html'
		}
	});
