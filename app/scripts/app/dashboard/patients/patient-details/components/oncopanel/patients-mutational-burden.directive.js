/**
 * Patient Oncopanel Mutational Burden section
 */
angular.module('matchminerUiApp')
	.directive('patientMutationalBurden', function () {
		return {
			restrict: "E",
			replace: true,
			scope: {
				clinical: '=',
				isEmbedded: '=',
				tooltip: '&'
			},
			templateUrl: 'scripts/app/dashboard/patients/patient-details/templates/oncopanel/oncopanel-mutational-burden.html'
		}
	});

/**
 * The CANCER_TYPE_PERCENTILE box
 */
angular.module('matchminerUiApp')
    .directive('patientMutationalBurdenCancerTypePercentileBox', function() {
        return {
            restrict: "E",
            link: function(scope, element, attrs) {
                scope.$watch(function(){
                    scope.style = {
                        height:element[0].offsetHeight+'px'
                    };
                });
            }
        }
    });
