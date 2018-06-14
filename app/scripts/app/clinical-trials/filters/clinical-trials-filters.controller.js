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

'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller: ClinicalTrialsFilterCtrl
 * @description
 * # ClinicalTrialsFilterCtrl
 * Controller of the clinical trials details
 */
angular.module('matchminerUiApp')
	.controller('ClinicalTrialsFiltersCtrl', ['$scope', '$state', '$log', 'ClinicalTrialsService',
		function ($scope, $state, $log, ClinicalTrialsService) {
			var ctf = this;
			ctf.filters = ClinicalTrialsService.getFilters();
			if (ctf.filters.length) {
				ctf.filters = assignOrder(ClinicalTrialsService.getFilters());
			}
			ctf.isLoading = false;
			ctf.mutOpen = false;
			ctf.facetOptions = ClinicalTrialsService.getFacetOptionsState();

			/**
			 * Keep track of updates in the clinical trial collection
			 */
			$scope.$watchCollection(
				function () {
					return ClinicalTrialsService.getFilterCategories();
				},
				function (newFilters) {
					if (newFilters !== undefined) {
						ctf.filters = assignOrder(newFilters);
					}
				}
			);
			
			function assignOrder(list) {
				var aggOrder = ["Gene (Mutant)", "Gene (Wildtype)", "Mutational Signatures", "Tissue",
					"Receptor Status", "Age", "Disease Status", "Drug", "Phase", "Disease Center", "Coordinating Center",
					"Trial Status"];
				return _.sortBy(list, function(item) {return aggOrder.indexOf(item.name)})
			}

			$scope.$watch(
				function () {
					return ClinicalTrialsService.isLoading;
				},
				function (isLoading) {
					ctf.isLoading = isLoading;
				}
			);
			
			$scope.$watchCollection(
				function () {
					return ClinicalTrialsService.getMetadata();
				},
				function () {
					var filters = ClinicalTrialsService.getFilterCategories();
					if (filters.length) {
						ctf.filters = assignOrder(filters);
					}
				}
			);

			ctf.isActive = function (key, value) {
				return ClinicalTrialsService.isActiveFilter(key, value);
			};
			
			ctf.allValuesNone = function(options) {
				return _.every(options, function(opt) {return opt.name === "NONE"})
			}

			ctf.toggleFilter = function (filterName, key, value, optionName) {
				if (ctf.isLoading) return false;
				return ClinicalTrialsService.searchFilter(filterName, key, value, optionName, true);
			};
			
			ctf.isFilterListOpen = function(filter) {
				return filter.openCategory;
			}
			
			ctf.toggleOpenFilterList = function(filter) {
				return filter.openCategory = !filter.openCategory;
			}

			/**
			 * Show all facet options for a filter.
			 * Limited to 100 options maximum
			 * @param filter
			 */
			ctf.showAllFacetsForFilter = function(filterName) {
				ctf.facetOptions[filterName] = ctf.facetOptions[filterName] > 5 ? 5 : ClinicalTrialsService.getFilterLimit();
				ClinicalTrialsService.setFacetOptionsState(ctf.facetOptions);
			};
		}]);
