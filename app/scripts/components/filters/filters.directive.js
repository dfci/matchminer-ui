angular.module('matchminerUiApp')
	.directive("genomicFilterBadge", function(){
		{
			return {
				restrict: "E",
				scope: {
					filter: "="
				},
				link: function(scope, element, attr) {
					scope.$watch('filter', function(newValue, oldValue) {
						if (newValue)
							scope.styles = {
								'background-color': scope.filter.badgeColor,
								'color' : scope.filter.badgeTextColor || 'black'
							}
					}, true);
				},
				template: "<md-chips class='gene-badge-container'><md-chip class='gene-badge' "
				+ " ng-style='styles'>"
				+ "<span>{{ filter.label }}</span>"
				+ "<md-tooltip md-autohide  class='gene-badge-tooltip' md-direction='bottom'>"
				+ "<b>Protocol-ID</b>"
				+ "<p>{{ filter.protocol_id || 'N/A'}}</p>"
				+ "<b>Description</b>"
				+ "<p>{{ filter.description || 'N/A'}}</p>"
				+ "</md-tooltip>"
				+ "</md-chip></md-chips>"
			}
		}
	});
