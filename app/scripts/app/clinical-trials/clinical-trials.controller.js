'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller: ClinicalTrialsCtrl
 * @description
 * # ClinicalTrialsCtrl
 * Controller of the clinical trials details
 */
angular.module('matchminerUiApp')
	.controller('ClinicalTrialsCtrl', ['$scope', '$log', 'ElasticSearchService', 'ClinicalTrialsService', 'Principal',
		function ($scope, $log, ElasticSearchService, ClinicalTrialsService, Principal) {
			var ct = this;
			ct.searchTerm = '';
			ct.numResults = 0;
			ct.metadata = ClinicalTrialsService.getMetadata();

			ct.isAuthenticated = Principal.isAuthenticated();
			
			ct.getChipName = function(name) {
				return _.contains(["Ms Status", "Mmr Status"], name) ? "Mutational Signature" : name;
			}
			
			$scope.$watch(
				function () {
					return (ElasticSearchService.getGeneSearchTerm() || "") + " " + (ElasticSearchService.getTumorTypeSearchTerm() || "") + " " + (ElasticSearchService.getDiseaseCenterSearchTerm() || "") + " " + (ElasticSearchService.getSearchTerm() || "");
				},
				function (searchTerm) {
					ct.metadata = ClinicalTrialsService.getMetadata();
					ct.searchTerm = searchTerm.trim();
				}
			);

			$scope.$watch(
				function () {
					return ClinicalTrialsService.isLoading;
				},
				function (isLoading) {
					ct.isLoading = isLoading;
				}
			);

			$scope.$watch(
				function () {
					return ClinicalTrialsService.getAll();
				},
				function (trials) {
					ct.numResults = trials.length || 0;
				}
			);

			$scope.$watch(
				function () {
					return ClinicalTrialsService.getReadableFilters();
				},
				function (updatedFilters) {
					ct.readableFilters = updatedFilters;
				}
			);

			ct.removeFilter = function(chip) {
				return ClinicalTrialsService.searchFilter(chip.filterName, chip.aggregator, chip.optionValue, chip.optionName, true);
			};

			ct.resetSearchFilters = function() {
                ClinicalTrialsService.resetSearchFilters();
			};
		}]);
