/**
 * Patient Oncopanel Mutational Signatures
 */
angular.module('matchminerUiApp')
	.directive('patientMutationalSignatures', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				tooltip: '&',
				filter: '='
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-mutational-signatures.html'
		}
	});
