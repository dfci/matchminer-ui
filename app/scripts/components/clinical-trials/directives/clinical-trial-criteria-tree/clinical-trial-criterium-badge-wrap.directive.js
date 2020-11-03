angular.module('matchminerUiApp')
	.directive('clinicalTrialBadgeWrap', function() {
		return {
			restrict: "E",
			replace: true,
			scope: {
				isNumber: '=',
				node: '='
			},
			templateUrl: 'scripts/components/partials/criterium-badges.html'
		}
	});
