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
 * @name matchminerUiApp.controller: ClinicalTrialsSearchCtrl
 * @description
 * # ClinicalTrialsSearchCtrl
 * Controller of the clinical trials search
 */
angular.module('matchminerUiApp')
	.controller('ClinicalTrialsSearchCtrl', ['$scope', '$state', '$stateParams', '$mdMedia', '$window', 'ClinicalTrialsService', 'ElasticSearchService', '$document',
		function ($scope, $state, $stateParams, $mdMedia, $window, ClinicalTrialsService, ElasticSearchService, $document) {
			var cts = this;
			
			if ($state.current.name === 'home' || $state.current.name === 'dashboard') {
				ElasticSearchService.setSearchTerm(null);
				ElasticSearchService.setGeneSearchTerm(null);
				ElasticSearchService.setDiseaseCenterSearchTerm(null);
				ElasticSearchService.setTumorTypeSearchTerm(null);
			}
			
			cts.isLargeMediaQuery = $mdMedia('gt-sm');
			
			$scope.$watch(function() {
				return $mdMedia('gt-sm');
			}, function(nv) {
				cts.isLargeMediaQuery = nv;
			});
			
			cts.isEmbedded = $stateParams.embeddedSearch;
			
			$scope.$watch(
				function () {
					return ElasticSearchService.getSearchTerm();
				},
				function (searchTerm) {
					/**
					 * When the search component is embedded in the trial results page, use the set ES search term
					 * When the search component is placed on the dashboard, empty the search term.
					 */
					cts.searchTerm = !_.isUndefined(cts.isEmbedded) ? searchTerm : '';
				}
			);
			$scope.$watch(
				function () {
					return ElasticSearchService.getGeneSearchTerm();
				},
				function (searchTerm) {
					cts.geneSearchTerm = !_.isUndefined(cts.isEmbedded) ? searchTerm : '';
				}
			);
			
			$scope.$watch(
				function () {
					return ElasticSearchService.getDiseaseCenterSearchTerm();
				},
				function (searchTerm) {
					cts.diseaseCenterSearchTerm = !_.isUndefined(cts.isEmbedded) ? searchTerm : '';
				}
			);
			
			$scope.$watch(
				function () {
					return ElasticSearchService.getTumorTypeSearchTerm();
				},
				function (searchTerm) {
					cts.tumorTypeSearchTerm= !_.isUndefined(cts.isEmbedded) ? searchTerm : '';
				}
			);

			cts.scrollToTumorType = function() {
				if ($state.current.name === 'home') {
                    $document.scrollToElementAnimated(angular.element(document.getElementById('small-gene-input-id')), 300, 500);
                }
			}
			
			cts.resizeAutocompleteMenu = function(type, length) {
				var searchType;
				switch (type) {
					case 'gene':
						searchType = 'geneSearch';
						break;
					case 'disease':
						searchType = 'diseaseCenterSearch';
						break;
					case 'tumor':
						searchType = 'tumorTypeSearch';
						break;
					case 'advanced':
					default:
						searchType = 'search';
						break;
				}

				if (length === 'short' ) {
					var input = document.getElementById('small-' + type + '-input-id');
					if (input) {
						document.getElementsByClassName('small-' + type + '-menu-class')[0].style.minWidth = input.offsetWidth + "px";
						var menu = document.getElementsByClassName('small-' + type + '-menu-class')[0];
						if (!menu.offsetWidth || cts[searchType + "Term"].length == 1) {
							setTimeout(function () {
								cts.timeoutWidth(menu, type, 'small', 0);
							}, 100)
						} else {
							document.getElementsByClassName('small-' + type + '-menu-class')[0].parentNode.parentNode.style.minWidth = menu.offsetWidth + "px";
						}
					}
				} else if (length === 'long') {
					var input = document.getElementById('big-' + type + '-input-id');
					if (input) {
						document.getElementsByClassName('big-' + type + '-menu-class')[0].style.minWidth = input.offsetWidth + "px";
						var menu = document.getElementsByClassName('big-' + type + '-menu-class')[0];
						if (!menu.offsetWidth) {
							setTimeout(function () {
								cts.timeoutWidth(menu, type, 'big', 0);
							}, 100)
						} else {
							document.getElementsByClassName('big-' + type + '-menu-class')[0].parentNode.parentNode.style.minWidth = menu.offsetWidth + "px";
						}
					}
				}
			}

			cts.timeoutWidth = function(menu, type, size, counter) {
				var minWidth = _.max(_.pluck(menu.children, 'offsetWidth'));
				if (String(minWidth).indexOf("Infinity") > -1 && counter < 10) {
					setTimeout(function () {
						counter ++;
						cts.timeoutWidth(menu, type, size, counter);
					}, 100);
				} else {
					document.getElementsByClassName(size + '-' + type + '-menu-class')[0].parentNode.parentNode.style.minWidth = minWidth + "px";
				}
			};

			cts.pageType = _.contains(['dashboard', 'home', undefined], $state.current.name) ? 'short' : 'long';
			
			cts.selectedItem = '';
			cts.selectedGeneItem = '';
			cts.selectedDiseaseCenterItem = '';
			cts.selectedTumorTypeItem = '';
			
			if (ElasticSearchService.getSearchTerm()) {
				this.openAdvancedSearch = true;
			} else cts.openAdvancedSearch = false;
			
			/**
			 * Disable the search control and listing when $stateParams
			 * (either from parent or current) holds an error.
			 */
			cts.isDisabled = $stateParams.error;

			/**
			 * Perform a search for ClinicalTrials using the argumented search term.
			 * @param term String to search for
			 */
			
			cts.clearAllTerms = function() {
				cts.searchTerm ="";
				cts.geneSearchTerm = "";
				cts.diseaseCenterSearchTerm = "";
				cts.tumorTypeSearchTerm = "";
				cts.search();
				cts.showAllClinicalTrials();
			}
			
			cts.search = function() {
				var term = cts.searchTerm;
				
				if (!this.openAdvancedSearch) {
					term = null;
				}
				
				var geneTerm = cts.geneSearchTerm;
				var diseaseCenterTerm = cts.diseaseCenterSearchTerm;
				var tumorTerm = cts.tumorTypeSearchTerm;
				
				var terms = {All: term,
							Gene: geneTerm,
							DiseaseCenter:diseaseCenterTerm,
							TumorType: tumorTerm};
				
				// If we arent on the clinicaltrials page redirect and search for term
				if ($state.current.name != 'clinicaltrials.overview') {
					$state.go('clinicaltrials.overview',
						{
							'searchTerm': term,
							'geneSearchTerm': geneTerm,
							'diseaseCenterSearchTerm': diseaseCenterTerm,
							'tumorTypeSearchTerm': tumorTerm
						});
				} else {
					// Clear term when searching for all results
					if (term == "" || !term) {
						ElasticSearchService.setSearchTerm(null);
						terms = _.omit(terms, 'All');
					}

					if (geneTerm == "" || !geneTerm) {
						ElasticSearchService.setGeneSearchTerm(null);
						terms = _.omit(terms, 'Gene');
					}
					if (diseaseCenterTerm == "" || !diseaseCenterTerm) {
						ElasticSearchService.setDiseaseCenterSearchTerm(null);
						terms = _.omit(terms, 'DiseaseCenter');
					}
					if (tumorTerm == "" || !tumorTerm) {
						ElasticSearchService.setTumorTypeSearchTerm(null);
						terms = _.omit(terms, 'TumorType');
					}

					ClinicalTrialsService.isDetailNavigation(false);

					ClinicalTrialsService.clearFilters();
					ClinicalTrialsService.clearReadableFilters();
					ClinicalTrialsService.clearFacetOptionsState();

					// Use elasticsearch factory to create query and perform search
					ClinicalTrialsService.fullTextSearch(terms);
				}
			};

			/**
			 * Fetch suggestions based on input terms.
			 * Includes autocomplete term suggestions and synonyms for
			 * - hugo_symbol
			 */
			cts.suggest = function(suggestion, fields) {
				if (!fields) {
					fields = [
						'protocol_no_suggest',
						'disease_status_suggest',
						'drug_suggest',
						'investigator_suggest',
						'mmr_status_suggest',
						'nct_number_suggest'
					];
				}

				//for local debugging
				//return [{text: "option 1"},{text: "option 2"},{text: "option 3"},{text: "option 4"},{text: "option 5"},{text: "option 6"},{text: "option 7"},{text: "option 8"},{text: "option 9"},{text: "option 10"}]
				return ClinicalTrialsService.suggestTermsForString(fields, suggestion);
			};

			cts.showAllClinicalTrials = function() {
				ElasticSearchService.setSearchTerm(null);
                ClinicalTrialsService.clearFilters();
                ClinicalTrialsService.clearReadableFilters();
                $state.go('clinicaltrials.overview');
			}

            //IE11 dropdowns don't overflow correctly
            $(document).ready(function() {
                var ua = navigator.userAgent;

                /* MSIE used to detect old browsers and Trident used to newer ones*/
                var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
                if(is_ie) {
                    var scrollers = document.getElementsByClassName('md-virtual-repeat-scroller');
                    for (var i = 0; i < scrollers.length; i++) {
                        var scroller = scrollers[i];
                        scroller.style.minWidth = '320px';
                    }
                }
            })
		}]);
