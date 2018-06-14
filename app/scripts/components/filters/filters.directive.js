/*
 * Copyright (c) 2017. Dana-Farber Cancer Institute. All rights reserved.
 *
 *  Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *
 * See the file LICENSE in the root of this repository.
 *
 * Contributing authors:
 * - berndvdveen
 *
 */

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
