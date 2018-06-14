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

/**
 * Recursively generate a clinical trial match criteria tree
 * Using the key index and match criteria as parameters
 */
angular.module('matchminerUiApp')
	.directive('clinicalTrialTree', ['$filter', '$compile', function ($filter, $compile) {
		return {
			restrict: "E",
			replace: true,
			scope: {
				treeIdx: '=',
				matchCriteria: '='
			},
			template: "<ul class='tree'></ul>",
			link: function(scope, element) {
				var tpl;
				var idx = scope.treeIdx;
				var node = scope.matchCriteria;

				if (angular.isArray(node)) {
					if (idx == 'and') {
						tpl =
							'<li ng-repeat="obj in ::matchCriteria">' +
								'<h4 class="criterium">Required</h4>' +
								'<clinical-trial-tree tree-idx="childIdx" match-criteria="::childNode" ng-repeat="(childIdx, childNode) in ::obj"></clinical-trial-tree>' +
							'</li>';
					}

					if (idx == 'or') {
						tpl =
							'<li ng-repeat="(childIdx, childNode) in ::matchCriteria">' +
								'<h4 class="criterium">Either</h4>' +
								'<clinical-trial-tree tree-idx="childIdx" match-criteria="::childNode"></clinical-trial-tree>' +
							'</li>';
					}
				}

				if($filter('isNumber')(idx) && (node['and'] || node['or'])) {
					tpl = '<clinical-trial-tree tree-idx="childIdx" match-criteria="::childNode" ng-repeat="(childIdx, childNode) in ::matchCriteria"></clinical-trial-tree>';
				}

				if($filter('isNumber')(idx) && (!node['and'] && !node['or'])) {
					tpl =
						'<li class="badge-item-wrap">' +
							'<clinical-trial-badge-wrap is-number="true" node="::matchCriteria"></clinical-trial-badge-wrap>' +
						'</li>';
				}

				// Lowest level badges for genomic / clinical keys
				if(idx =='clinical' || idx == 'genomic') {
					tpl =
						'<li class="badge-item-wrap">' +
							'<clinical-trial-badge-wrap node="::matchCriteria"></clinical-trial-badge-wrap>' +
						'</li>';
				}

				$compile(tpl)(scope, function(cloned, scope){
					element.append(cloned);
				});
			}
		}
	}]);