/**
 * Created by tamba on 11/16/17.
 */

/**
 * Patient Oncopanel Mutational Signatures
 */
angular.module('matchminerUiApp')
	.directive('patientAdditionalMutationalSignatures', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				variants: '=',
				filter: '=',
				isEmbedded: '=',
				tooltip: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel-additional-mutational-signatures.html'
		}
	});