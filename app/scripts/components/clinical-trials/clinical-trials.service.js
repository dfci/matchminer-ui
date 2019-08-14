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
 * @Service ClinicalTrialsService
 * @Description Service layer interfacing all methods to interact with Clinical Trials
 *
 * Includes interfacing with the ElasticSearchService to handle searches via the ElasticSearch API
 */
angular.module('matchminerUiApp')
	.factory('ClinicalTrialsService',
		['$q', '$log', '$window', 'ClinicalTrialsREST', 'ElasticSearchService', '_', 'TEMPLATES', 'Mailto', '$analytics', 'ENV',
			function ($q, $log, $window, ClinicalTrialsREST, ElasticSearchService, _, TEMPLATES, Mailto, $analytics, ENV) {

				var _metadata = {};
				_metadata.total_elements = 0;
				_metadata.current_page = 1;

				var service = {
					trialMatchingSearch: false
				};
				
				this.mrn = "";

				var _TRACKEDFILTERS = [];

				// Initialize initial configuration
				service.init = function() {
					service = {
						metadata: _metadata,
						isLoading: false,
						filterCategories: [],
						aggregationOptions: [],
						filters: [],
						readableFilters: [],
						filterState: {},
						stateParams: {},
						facetOptionsState: {},
						trial: {},
						patientMatchesPage: 0,
						hasPatientMatches: false
					};
				};

				service.init();

                // ElasticSearch configuration.
                var _ESCONFIG = {};
                _ESCONFIG.AGGREGATOR_FACET_LIMIT = 1000;

                service.getFilterLimit = function() {
                    return _ESCONFIG.AGGREGATOR_FACET_LIMIT
                };

				// Reset fields
				service.reset = function(resetFilters) {
					if (resetFilters) {
					    service.filters = [];
                        service.readableFilters = [];
                    }
					service.clinicalTrialsList = [];
					service.patientMatchesPage = 0;
					service.hasPatientMatches = false;
					_metadata.total_elements = 0;
					_metadata.current_page = 1;
				};
				
				service.resetSearchFilters = function() {
                    // Reset all filtering and search states
					
                    ElasticSearchService.resetSearchTerms();
					service.clearFilters();
                    service.clearReadableFilters();
                    service.clearFacetOptionsState();
                    
                    // Use elasticsearch factory to create query and perform search
                    service.fullTextSearch({
						All: ElasticSearchService.getSearchTerm(),
						Gene: ElasticSearchService.getGeneSearchTerm(),
						DiseaseCenter: ElasticSearchService.getDiseaseCenterSearchTerm(),
						TumorType: ElasticSearchService.getTumorTypeSearchTerm()
                    });
				};
				
				service.setMRN = function(mrn) {
					this.mrn = mrn;
				};
				
				service.getMRN = function() {
					return this.mrn;
				};

				/**
				 * Order of priorities of highlighting fields
				 */
				var highlight_priorities = {
                    // '_elasticsearch.genes': "Gene",
                    // '_elasticsearch.variants': "Gene Variant",
                    // '_elasticsearch.wildtype_genes': "Wildtype",
                    // '_elasticsearch.exclusion_genes': "Gene Exclusion Criteria",
                    // '_elasticsearch.cnv_genes': "CNV",
                    // '_elasticsearch.sv_genes': "SV",
                    '_elasticsearch.protocol_no': "Protocol #",
                    '_elasticsearch.drugs': "Drug",
                    '_elasticsearch.age': "Age",
                    '_elasticsearch.phase': "Phase",
                    '_elasticsearch.investigator': "Investigator",
                    // '_elasticsearch.disease_center': 'Disease Center',
                    '_elasticsearch.nct_number': 'NCT number',
					'_elasticsearch.mmr_status': 'Mutational Signature',
                    '_elasticsearch.ms_status': 'Mutational Signature',
					'_elasticsearch.disease_status': 'Disease Status'
                };

				/**
				 * Search field aggregators in order they should appear in the list.
				 * Aggregators missing from this list will NOT be shown.
				 */
				service.orderedAggregations = [
					'gene_(mutant)',
					'gene_(wildtype)',
					'mutational_signatures',
					'tissue',
					'receptor_status',
					'age',
					'disease_status',
					'drug',
					'phase',
					'disease_center',
					'coordinating_center',
					'trial_status'
				];

				/**
				 * Field definitions for the ElasticSearch aggregators that should be available and used while building the query.
				 * @type {{gene_(mutant): {terms: {field: string}}, gene_(wildtype): {terms: {field: string}}, disease_status: {terms: {field: string}}, phase: {terms: {field: string}}, age: {terms: {field: string}}, drug: {terms: {field: string}}, trial_status: {terms: {field: string}}, coordinating_center: {terms: {field: string}}, disease_center: {terms: {field: string}}, tumor_type: {terms: {field: string}}}}
				 */
				var aggregators = {
					"gene_(mutant)": {
						"terms": {
							"field": "_summary.nonsynonymous_genes"
						}
					},
					"gene_(wildtype)": {
						"terms": {
							"field": "_summary.nonsynonymous_wt_genes"
						}
					},
					"mutational_signatures": {
						"terms": {
							"field": "_summary.mutational_signatures"
						}
					},
					"disease_status": {
						"terms": {
							"field": "_summary.disease_status"
						}
					},
					"receptor_status": {
						"terms": {
							"field": "_summary.hormone_receptor_status"
						}
					},
					"phase": {
						"terms": {
							"field": "_summary.phase_summary"
						}
					},
					"age": {
						"terms": {
							"field": "_summary.age_summary"
						}
					},
					"drug": {
						"terms": {
							"field": "_summary.drugs"
						}
					},
					"trial_status": {
						"terms": {
							"field": "_summary.status.value"
						}
					},
					"coordinating_center": {
						"terms": {
							"field": "_summary.site"
						}
					},
					"disease_center": {
						"terms": {
							"field": "_summary.disease_center"
						}
					},
					"tissue": {
						"terms": {
							"field": "_summary.primary_tumor_types"
						}
					}
				};

				/**
				 * Formatting utility function to make the aggregator string fields more readable
				 * Replaces underscore characters with spaces and uppercases every first letter of every word
				 */
				var formatName = function (str) {
					return str.replace(/\w\S*/g, function (txt) {
						return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
					});
				};
				
				var formatMSName = function (str) {
					var ind = str.indexOf('-');
					if (ind > -1) {
						return str.slice(0, ind + 2).toUpperCase() + str.slice(ind + 2, str.length);
					} return str.toUpperCase();
				};

				/**
				 * Perform a word count on a string.
				 * @param text
				 * @returns {string} number of words in string
				 */
				var wordCountOf = function(text) {
					var s = text ? text.split(/\s+/) : 0; // it splits the text on space/tab/enter
					return s ? s.length : '';
				};


				/**
				 * Recursive function, iterating over 'and' / 'or' arrays and collecting and transforming
				 * objects holding the hugo_symbol and variant_category fields.
				 * @param criteria
				 * @returns {Array}
				 */
				var parseVariantCriteria = function(criteria) {
					var variants = [];

					_.each(criteria, function (v, k) {
						if (k == 'and' || k == 'or' || isNumeric(k)) {

							// value is array. Iterate and recurse
							_.each(v, function (i) {
								// Store variant match when a hugo_symbol, variant_category have been defined in the criteria.
								// Depending on the variant_category, store the respective specific alteration.
								if (i.hasOwnProperty('hugo_symbol')) {
									var x = {};
									x.hugo_symbol = i.hugo_symbol.toUpperCase().replace('_', ' ');
									x.variant_category  = i.variant_category;

									var cat = x.variant_category;

									// Handle alteration negation
									if (x.variant_category && x.variant_category.charAt(0) == '!') {
										x.variant_category = "NO " + x.variant_category.substr(1);

										// If variant category is negated, set boolean and strip negating char.
										cat = i.variant_category.substr(1);
									}

									if (!cat && i.wildtype) {
										x.variant_category = '---';
										x.specific_alteration = "Wild-type";
									}

									switch (cat) {
										case 'Mutation':
											var non_pc_mutation = true;

											if (i.variant_classification) {
												non_pc_mutation = false;

												var rpl = i.variant_classification.replace(/_/g, " ");
												x.specific_alteration = formatName(rpl);

												var ptWt = i.protein_change || i.wildcard_protein_change || "";

												if (i.exon) {
													ptWt += ("Exon " + i.exon);
												}

												x.specific_alteration += (" " + ptWt);
											}

											if (non_pc_mutation && i.exon) {
												x.specific_alteration = ("Exon " + i.exon);
											}

											if (non_pc_mutation && !i.exon) {
												x.specific_alteration = i.protein_change || i.wildcard_protein_change;
											}

											break;
										case 'Copy Number Variation':
											x.specific_alteration = i.cnv_call;
											break;
										case 'Structural Variation':
											var display = '';
											var left = i.hugo_symbol;
											var right = i.fusion_partner_hugo_symbol;

											if (left == null || left === 'any_gene') {
												left = ''
											}

											if (right == null || right === 'any_gene') {
												right = ''
											}

											if (left.length !== 0 && right.length !== 0) {
												display += left.toUpperCase() + '-' + right.toUpperCase()
											} else {
												if (left.length === 0 && right.length === 0) {
													display = 'ANY GENE'
												} else if (left.length === 0) {
													display = right.toUpperCase()
												} else if (right.length === 0) {
													display = left.toUpperCase()
												}
											}
											x.specific_alteration = display;
											break;
										default:
											break;
									}

									var negating = false;

									// Handle alteration negation
									if (x.specific_alteration && x.specific_alteration.charAt(0) == '!') {
										if (!i.display_name) {
											negating = true;
										}
										x.specific_alteration = "NO " + x.specific_alteration.substr(1);
									}

									// Set dashes when specific alteration is not defined.
									if (!x.specific_alteration) {
										x.specific_alteration = "---";
									}

									if (!negating) {
										variants.push(x);
									}
								} else {
									variants.push(parseVariantCriteria(i));
								}
							});
						}
					});
					return variants;
				};

				/**
				 * Clears the clinical trials in the service
				 */
				service.emptyAll = function () {
					service.clinicalTrialsList = [];
				};

				/**
				 * Get all clinical trials
				 * @returns {Array}
				 */
				service.getAll = function () {
					return this.clinicalTrialsList;
				};

				/**
				 * Update all the metadata produced by the search and used by the clinical trials page.
				 * @param {Object} res returned from a successful elastic search
				 * @returns {Object} holding the metadata.
				 */
				service.updateMetadata = function (res) {
					if (!res) return false;
					if (this.hasPatientMatches) {
						service.metadata.current_page = getPatientMatchesPage();
					} else {
						service.metadata.current_page
							= ElasticSearchService.getSearchFrom() > 0
							? Math.floor(ElasticSearchService.getSearchFrom() / ElasticSearchService.getSearchSize()) + 1
							: 1;
					}
					service.metadata.total_elements = res.hits.total;
					service.metadata.page_size = ElasticSearchService.getSearchSize();
					service.metadata.time_taken = res.took;
					service.metadata.order = ElasticSearchService.getSearchSort();
					service.metadata.is_timed_out = res.timed_out;
					service.metadata.max_score = res.hits.max_score;

					return service.metadata;
				};

				/**
				 * Returns the available metadata object for the clinical trials service.
				 * @returns {{}}
				 */
				service.getMetadata = function () {
					return this.metadata;
				};

				/**
				 * Parse the search aggregations and transform and update the filters data structure.
				 * @param {Object} aggregations produced by an elastic search.
				 * @returns [] Array of objects with filter properties with the buckets and the counts.
				 */
				service.updateFilterCategories = function (aggregations) {
					this.filterCategories = [];
					// Retrieve term field from the argumented aggregators.
					_.each(service.orderedAggregations, function (key) {
						var value = aggregations[key];
						var agg = aggregators[key].terms.field;
						var filter = service.filterState[key] || {};
						var name = key.replace('_', ' ');
						filter.name = formatName(name);
						filter.options = [];

						var sp = service.getStateParams();
						var queryKey = key;
						if (key == 'gene_(mutant)') {
							queryKey = 'gene_mutant';
						}
						if (key == 'gene_(wildtype)') {
							queryKey = 'gene_wildtype';
						}

						if(sp.hasOwnProperty(queryKey) && sp[queryKey]) {
							filter.openCategory = true;
							service.facetOptionsState[filter.name] = 100;
						}

						// Aggregator to filter for
						filter.aggregator = agg;

						// Add options to the filter
						_.each(value[key].buckets, function (bucket) {
							var option = {};

							if (!!bucket.key && bucket.key.charAt(0) == '!') {
								return;
							}

							/**
							 * Required transformations for facet option names.
							 */
							option.name = service.getOptionForValue(bucket.key, key);

							// Used for lookup of URL query param values
							if (key !== 'gene_(wildtype)' || option.name !== 'WT') {
								service.aggregationOptions.push(option.name);

								// Only open gene_mutant category expanded
								if (key == 'gene_(mutant)') {
									filter.openCategory = true;
								}

								option.key = bucket.key;
								option.count = bucket.doc_count;
								filter.options.push(option);
							}
						});

						service.filterState[key] = filter;
						service.filterCategories.push(filter);
					});

					return service.filterCategories;
				};

				service.getOptionForValue = function(value, bucket) {
					var optionName = "";

					// Retain value formatting of option name
					if (   bucket == 'disease_center'
						|| bucket == 'coordinating_center'
						|| bucket == 'study_site'
						|| bucket == 'tissue'
						|| bucket == 'receptor_status'
						|| bucket == 'trial_status') {
						optionName = value;
					} else if (bucket == 'mutational_signatures') {
						optionName = formatMSName(value);
					} else {
						optionName = formatName(value);
					}

					if (value == '_SOLID_') {
						optionName = 'All Solid Tumors';
					}

					if (value == '_LIQUID_') {
						optionName = 'All Liquid Tumors';
					}

					if (   bucket == 'gene_(mutant)'
						|| bucket == 'phase'
						|| bucket == 'gene_(wildtype)') {
						optionName = optionName.toUpperCase();
					}

					if (bucket == 'phase') {
						optionName = 'Phase ' + optionName;
					}

					return optionName;
				};

				/**
				 * Get all setup filter categories to be used in the Clinical Trial Filters component.
				 * All filter categories are created by the updateFilterCategories method.
				 * @returns {Array}
				 */
				service.getFilterCategories = function () {
					return this.filterCategories;
				};

				/**
				 * Search wrapper implementation for clinical trials.
				 * Handles calling of all the required ElasticSearchService methods
				 * prior to executing the search.
				 *
				 * Search is built up to mimick the Zappos web store search principal.
				 * Filtering for facets will perform a OR operation within a aggregator
				 * But will perform a AND logic operation between aggregators.
				 *
				 * @param {String} term indicating what the search text should be
				 * @returns {promise} Promise
				 */
				service.fullTextSearch = function(terms) {
					
					if (!_.isObject(terms)) terms = {All: terms};
					
					this.isLoading = true;
					
					var deferred = $q.defer();
					ElasticSearchService.setSearchType('trial');
					
					// Clear filters if a different search term is entered
					
					var setTerms = _.mapObject(terms, function(value, key) {
						if (key === 'All') return ElasticSearchService.getSearchTerm();
						return ElasticSearchService['get' + key + 'SearchTerm']();
					});
					
					if (!_.isEmpty(terms) && !_.isEmpty(setTerms) && !_.isEqual(terms, setTerms)) {
						this.filters = [];
						ElasticSearchService.reset(false);
					}

					var aggCategories = {};
					
					if (!_.isEmpty(terms)) {
						/**
						 * Only clear sorting when search terms are different
						 * so that sorting in a search will be retained across page navigations
						 */
						
						if (!_.isEqual(terms, setTerms)) {
							ElasticSearchService.clearSearchSort();
						}
						_.keys(terms).forEach(function(termKey) {
							if (termKey === 'All') ElasticSearchService.setSearchTerm(terms[termKey]);
							else ElasticSearchService['set' + termKey + 'SearchTerm'](terms[termKey]);
						});
						
					} else if ((_.some(_.values(terms), function(trm) {return trm != null }) || this.isTrialMatching()) && !service.isDetailNavigation()) {
						/**
						 * Initial search for all trials, apply default sorting
						 * Does not reset when returning from a trial detail view
						 */
						ElasticSearchService.reset(true);
					}
					
					/**
					 * Preprocess search aggregators to match active filters
					 *
					 * For all the defined aggregator fields check if there are any filters set.
					 * The goal is to create a filter query set for each aggregator separately
					 * where filters for the currently proccessed aggregator are left out.
					 * This is done to give the user additional selection options for within the aggregator
					 * but limited by all the other aggregator field filters.
					 */
					_.each(aggregators, function (v, k) {
						var agg = v.terms.field;

						// Default filter matching every field
						var match_all = {"match_all": {}};

						var i = service.getFiltersExcludedWith(agg);
						var o = {};
						o.filter = {};
						if (i.length) {
							o.filter.and = i;
						} else {
							o.filter = match_all;
						}

						// Limit
						aggregators[k].terms.size = _ESCONFIG.AGGREGATOR_FACET_LIMIT;
						o.aggs = {};
						o.aggs[k] = aggregators[k];

						aggCategories[k] = o;
					});

					ElasticSearchService.setSearchAggregators(aggCategories);
					ElasticSearchService.setSearchFilters(this.filters);

					ElasticSearchService.search()
						.then(function (res) {
							service.clinicalTrialsList = res.hits.hits;
							service.updateMetadata(res);
							service.updateFilterCategories(res.aggregations);
							service.processReadableFilters();
							service.isLoading = false;

							// Site search tracking
							if (ElasticSearchService.hasSearchTerm()) {
								var searchTerm = ElasticSearchService.getSearchTerm() + " " + ElasticSearchService.getGeneSearchTerm() + " " + ElasticSearchService.getTumorTypeSearchTerm() + " " + ElasticSearchService.getDiseaseCenterSearchTerm();
								if (ElasticSearchService.hasSearchFilters()) {
									searchTerm += " (F:: " + _TRACKEDFILTERS.join(",") +")";
								}
								$analytics.trackSiteSearch(searchTerm, 'Clinical Trials', service.clinicalTrialsList.length);
							} else if (ElasticSearchService.hasSearchFilters()) {
								var filters = " (F:: " + _TRACKEDFILTERS.join(",") +")";
								$analytics.trackSiteSearch(filters, 'Clinical Trials', service.clinicalTrialsList.length);
							}

							deferred.resolve(res);
						})
						.catch(function (err) {
							service.isLoading = false;
							$log.warn("clin trails serv err ", err);
							deferred.reject(err);
						}).finally(function() {
							service.setIsTrialMatching(false);
						});

					return deferred.promise;
				};

				service.processReadableFilters = function() {
					// Check if the URL param query option is valid
					_.each(this.getReadableFilters(), function(readableFilter) {
						readableFilter.valid = service.aggregationOptions.indexOf(readableFilter.optionName) > -1;
					});
				};

				service.suggestTermsForString = function (fields, searchSuggestTerm) {
					var deferred = $q.defer();

					// Make sure argument is an array
					var suggestFields = fields;
					if (!_.isArray(fields)) {
						suggestFields = [fields]
					}

					ElasticSearchService.setSearchIndex(ENV.elasticsearch.index);
					ElasticSearchService.setSearchType('trial');
					ElasticSearchService.setSearchSuggestTerm(searchSuggestTerm);
					ElasticSearchService.suggest(fields)
						.then(function(res){
							var suggestions = [];
							_.each(fields, function(f) {
								_.each(res.suggest[f][0].options, function(i) {
									i.type = f;
									suggestions.push(i);
								})
							});

							// reformat suggestion text
							suggestions = suggestions.filter(function(el) {
								return el.text !== "None";
							});

							for (var i=0; i < suggestions.length; i++) {
                                if (suggestions[i].type === "hugo_symbol_suggest") {
									suggestions[i].text = suggestions[i].text + ' All Variants';
                                } else if (suggestions[i].type === "wildtype_suggest") {
									suggestions[i].text = suggestions[i].text.split(' ')[0] + ' Wild-Type';
								}
							}

							deferred.resolve(suggestions);
						})
						.catch( function(err) {
							$log.warn("Error occurred while searching for suggestions ", err);
							deferred.reject(err);
						});

					return deferred.promise;
				};

				/**
				 * Pagination implementation for the md-data-table component.
				 * @param {number} page to start querying from
				 * @param {number} limit indicating the page size
				 * @returns {promise} of the elastic search query
				 */
				
				function setPatientMatchesPage(page) {
					service.patientMatchesPage = page;
				}
				
				function getPatientMatchesPage() {
					return service.patientMatchesPage;
				}
				
				service.paginate = function (page, limit, hasPatientMatches) {
					if (hasPatientMatches) {
						this.hasPatientMatches = true;
						setPatientMatchesPage(page);
					}
					ElasticSearchService.setSearchSize(limit);
					var searchFrom = hasPatientMatches ? 0 : (+page - 1) * limit;
					ElasticSearchService.setSearchFrom(searchFrom);

					return this.fullTextSearch({
						All: ElasticSearchService.getSearchTerm(),
						Gene: ElasticSearchService.getGeneSearchTerm(),
						DiseaseCenter: ElasticSearchService.getDiseaseCenterSearchTerm(),
						TumorType: ElasticSearchService.getTumorTypeSearchTerm()
					});
				};

				/**
				 * Sort implementation for the md-data-table component.
				 * If the order string is prefixed with a '-' this denotes a descending sort
				 * @param order String with the clinical trial property to sort for
				 * @returns {promise} of the elastic search query
				 */
				service.sort = function (order) {
					ElasticSearchService.clearSearchSort();
					ElasticSearchService.setSearchSort(order);
					return this.fullTextSearch({
						All: ElasticSearchService.getSearchTerm(),
						Gene: ElasticSearchService.getGeneSearchTerm(),
						DiseaseCenter: ElasticSearchService.getDiseaseCenterSearchTerm(),
						TumorType: ElasticSearchService.getTumorTypeSearchTerm()
					});
				};

				/**
				 * Get a list of filters applied to the available clinical trials
				 * and partially applied to every active aggregator
				 * @returns {Array}
				 */
				service.getFilters = function () {
					return this.filters;
				};

				/**
				 * Sets a list of filters applied to the available clinical trials
				 * @returns {Array}
				 */
				service.setFilters = function (filters) {
					this.filters = filters;
				};

				/**
				 * Clears the list of active filters
				 */
				service.clearFilters = function() {
					this.filters = [];
				};

				service.clearReadableFilters = function() {
					this.readableFilters = [];
				};

				/**
				 * Toggles a elasticsearch query filter using the field aggregator key and its value
				 * When a filter is active it is removed and the query is updated.
				 * In case the filter does not exist yet it gets added and the query is updated.
				 * @param {String} aggregator field based on ElasticSearch result.
				 * @param {String} value of the field to filter query for.
				 * @returns {boolean} indicating the new status of the filter.
				 */
				service.searchFilter = function (filterName, aggregator, value, optionName, doSearch) {
					// Remove if already active
					var isActive = this.isActiveFilter(aggregator, value);
					var aggregatorCat = this.getFilterForAggregator(aggregator);

					/**
					 * Check if the filter is active
					 * Remove from array
					 * When it was the last element removed, remove filter.
 					 */
					if (isActive) {
						var aggTerm = aggregatorCat.terms[aggregator];
						var idxAggTerm = aggTerm.indexOf(value);

						// Remove value from aggregator terms array
						aggTerm.splice(idxAggTerm, 1);

						// Set array and check remaining elements.
						// When array is empty, delete filter.
						if (aggTerm.length) {
							_.each(this.filters, function (o) {
								_.each(o.or, function(f) {
									if (f.terms.hasOwnProperty(aggregator)) {
										f.terms[aggregator] = aggTerm;
									}
								});
							});
						} else {
							this.filters = _.reject(this.filters, function(o) {
								var found_f;
								_.find(o.or, function(f) {
									if (!!f.terms[aggregator]) {
										found_f = f.terms[aggregator].length == 0;
									}
								});
								return found_f;
							});
						}

						// Remove from the list of tracked filter values
						var idx = _TRACKEDFILTERS.indexOf(value);
						if (idx > -1) {
							_TRACKEDFILTERS.splice(idx, 1);
						}

						// Remove the active filter from the readable filters
						var fil = _.filter(this.readableFilters, function(readableFilter) {
							return readableFilter.optionValue != value;
						});

						service.setReadableFilters(fil);
					} else {
						// Category exists, add filter value to array.
						if (aggregatorCat) {
							_.each(this.filters, function(f){
								_.each(f.or, function(fo) {
									if(fo.terms.hasOwnProperty(aggregator)) {
										fo.terms[aggregator].push(value);
									}
								});
							});
						} else {
							var ft = {};
							var f = {};
							ft.or = [];
							f.terms = {};
							f.terms[aggregator] = [];
							f.terms[aggregator].push(value);
							ft.or.push(f);

							this.filters.push(ft);
						}

						// Add to the list of tracked filter values
						_TRACKEDFILTERS.push(value);

						// Add readable filter
						var readableFilter = {
							'filterName': filterName,
							'aggregator': aggregator,
							'optionValue': value,
							'optionName': optionName
						};

						service.readableFilters.push(readableFilter);
					}

					ElasticSearchService.setSearchFilters(this.filters);
					if (doSearch) {
						this.fullTextSearch({
							All: ElasticSearchService.getSearchTerm(),
							Gene: ElasticSearchService.getGeneSearchTerm(),
							DiseaseCenter: ElasticSearchService.getDiseaseCenterSearchTerm(),
							TumorType: ElasticSearchService.getTumorTypeSearchTerm()
						})
					}
					return !isActive;
				};

				service.setStateParams = function(stateParams) {
					this.stateParams = stateParams;
				};

				service.getStateParams = function() {
					return this.stateParams;
				};

				service.handleSearchParamFilter = function(stateParams) {
					service.setStateParams(stateParams);

					// Only the stateParam keys with defined values
					var filteredStateParams = Object.keys(stateParams).filter(function(key){
						return stateParams[key] != undefined;
					});

					// For each of the defined state params add as search filter
					if (Object.keys(stateParams).length <= 2) {
						return false;
					} else if (filteredStateParams.length > 1){
						service.clearFilters();
						service.clearReadableFilters();
					}

					for (var key in stateParams) {
						var queryKey = key;
						var queryValue = stateParams[queryKey];
						var queryName = queryValue;

						if (key == 'query' && queryValue) {
							ElasticSearchService.setSearchTerm(stateParams[key]);
						}
						
						if (queryValue) {
							if (key == 'gene_mutant') {
								key = 'gene_(mutant)';
								queryValue = queryValue.toLowerCase();
							}
							if (key == 'gene_wildtype') {
								key = 'gene_(wildtype)';
								var q = queryValue.split(/ /);
								queryValue = 'wt ' + q[1];
							}
							if (key == 'drug') {
								queryValue = queryValue.toUpperCase();
							}
							if (key == 'tissue') {
								if (queryValue == 'All Solid Tumors') {
									queryValue = '_SOLID_';
								}

								if (queryValue == 'All Liquid Tumors') {
									queryValue = '_LIQUID_';
								}
							}
						}

						// check also if property is not inherited from prototype
						if (stateParams.hasOwnProperty(queryKey) && queryValue && aggregators.hasOwnProperty(key)) {
							// If we have a value set for the filter, apply it as a search filter
							var aggregator = aggregators[key].terms.field;
							var filterName = key.replace('_', ' ');
							var filter = {
								'name': formatName(filterName),
								'agg': aggregator,
								'optionValue': queryValue,
								'optionName': queryName
							};

							this.searchFilter(filter.name, filter.agg, filter.optionValue, filter.optionName, false);
						}
					}
				};

				/**
				 * Check if a filter is currently active in the query.
				 * Uses the aggregator key and its value to check in the list of active filters.
				 * @param aggregator field (Filter category)
				 * @param value String value of the option (de-)selected
				 * @returns {boolean} indicating if the aggregator field combination is active
				 */
				service.isActiveFilter = function (aggregator, value) {
					var found_f;

					_.some(this.filters, function(fo) {
						 _.find(fo.or, function(f) {
							if (f.terms.hasOwnProperty(aggregator)) {
								found_f = f.terms[aggregator].indexOf(value) > -1;
							} else {
								found_f = false;
							}
						});

						return found_f;
					});

					return found_f;
				};

				/**
				 * Get the defined aggregators for this service type, suitable for an ElasticSearch query
				 * @returns {{}} of aggregators
				 */
				service.getAggregators = function () {
					return aggregators;
				};

				/**
				 * Get a filter for the argumented aggregator
				 * @param aggregator
				 * @returns {*}
				 */
				service.getFilterForAggregator = function(aggregator) {
					var found_f;

					 _.each(this.filters, function(fo) {
						_.each(fo.or, function(o) {
							if (o.terms.hasOwnProperty(aggregator)) {
								found_f = o;
							}
						});
					});

					return found_f;
				};

				/**
				 * Fetch all filters without argumented aggregator filter
				 * @param aggregator
				 * @returns {*|{}|Array.<T>}
				 */
				service.getFiltersExcludedWith = function(aggregator) {
					var found_f = [];

					_.each(this.filters, function(fo) {
						var filtered = _.filter(fo.or, function(o) {
							return !o.terms.hasOwnProperty(aggregator);
						});

						var trans = _.map(filtered, function(o){
							var r = {};
							r.or = [];
							r.or.push(o);
							return r;
						});

						found_f = [].concat(found_f, trans);
					});

					return found_f;
				};

				/**
				 * Get the active filters in a readable format
				 * @returns {readableFilters|{}}
				 */
				service.getReadableFilters = function() {
					return service.readableFilters;
				};

				/**
				 * Setter for the active filters in a readable format
				 * @param readablefilters
				 */
				service.setReadableFilters = function(readablefilters) {
					service.readableFilters = readablefilters;
				};


				/**
				 * Return the most preferred highlight context determined by priority listing for variables.
				 * @param trial Clinical trial object
				 * @returns String of the highlight context.
				 */
				service.getHighlightContext = function(trial) {
					if (!trial.highlight) {
						return false;
					}
					var found_t = '';
                    var has_alternative = false;

					_.each(Object.keys(highlight_priorities), function (p) {
						if (trial.highlight.hasOwnProperty(p)) {
							found_t += '<li>' + highlight_priorities[p] + ': ' + trial.highlight[p][0] + '</li>';
							return false;
						}
					});

                    trial.searchContext = has_alternative || found_t;
					if (found_t !== '') {
						return '<ul>' + found_t.replace('_SOLID_', 'All Solid Tumors') + '</ul>';
					}
					return;
				};

				/**
				 * Get trial by ID
				 * @param {String} protocol_no of the clinical trial to be retrieved (protocol_no)
				 * @returns {promise}
				 */
				service.getTrial = function (protocol_no) {
					return ClinicalTrialsREST.findById({'where': { 'protocol_no': protocol_no }}).$promise;
				};

				/**
				 * Set the trial in the service
				 * @param trial
				 */
				service.setTrial = function(trial) {
					this.trial = trial;
				};

				/**
				 * Set the facet options state
				 */
				service.setFacetOptionsState = function(facetOptions) {
					this.facetOptionsState = facetOptions;
				};

				/**
				 * Get the set facetOptionsState
				 */
				service.getFacetOptionsState = function() {
					return this.facetOptionsState;
				};

				/**
				 * Clear the facetOptionsState
				 */
				service.clearFacetOptionsState = function(){
					this.facetOptionsState = {};
				};

				/**
				 * Sort the step list by the nested steps defined in the treatment list
				 * @param trial
				 * @returns [Array]
				 */
				service.getSortedTreatmentStepList = function(trial) {
					var arr = [];
					var obj = trial.treatment_list.step;
					Object.keys(obj).forEach(function(e) {arr.push(obj[e])});
					var sorted = _.sortBy(arr, function(s) { return s.step_code; });

					return $q.resolve(sorted);
				};

				/**
				 * Resursively parse the genomic alterations defined in the match criteria.
				 * Match criteria can be present at multiple depth levels such as
				 *    - Step
				 *    - Arm
				 *    - Dose
			     *
				 * @param trial
				 * @returns {*}
				 */
				service.getVariantsFromTreatmentStepList = function(trial) {
					var deferred = $q.defer();

					if (!trial || !trial.treatment_list) {
						return $q.reject("No trial or treatment list available to parse.");
					}

					var variants = [];

					// Parse step level criteria
					_.each(trial.treatment_list.step, function(step) {
						if (step.match) {
							variants.push(parseVariantCriteria(step.match));
						}

						// Parse arm level criteria
						_.each(step.arm, function(arm) {
							if (arm.match) {
								variants.push(parseVariantCriteria(arm.match));
							}

							// Parse dose level criteria
							_.each(arm.dose_level, function(dose) {
								if (dose.match) {
									variants.push(parseVariantCriteria(dose.match));
								}
							});
						});
					});

					// Remove duplicates from the variant array using the hugo_symbol, variant_category
					// and specific_alteration fields
					var variantArray = _.flatten(variants);
					var uniq = _.uniq(variantArray, function(elem) {
						return JSON.stringify(_.pick(elem, ['hugo_symbol', 'variant_category', 'specific_alteration']));
					});

					if (uniq) {
						return $q.resolve(uniq);
					}

					return deferred.$promise;
				};


				/**
				 Updated on June 21, 2017:
				 API now handles determining who is the principal investigator. We return that value here
				 */
				service.getTrialCoordinator = function(trial) {
					return trial._summary.dfci_investigator;
				};

				/**
				 * Check if current call is a clinical trial detail navigation
				*/
				service.isDetailNavigation = function(detailNavigation) {
					if(detailNavigation) {
						this.detailNavigation = detailNavigation;
					}
					return this.detailNavigation;
				};

				/**
				 * Generate an email body and open an email window of the default email client
				 * prefilled with email address, subject and body.
				 *
				 * NOTE: Various IE versions might fail to open a mailto link when the email body has a length greater
				 * than 507 characters.
				 *
				 * @param event
				 * @param trial
				 * @param coordinator_email
				 */
				service.emailCoordinator = function(event, trial, coordinator_email) {
					event.stopPropagation();

					var recipient = coordinator_email;
					var options = {
						subject: TEMPLATES.clinical_trial.contact_coordinator_subject + ' ' + trial.protocol_no,
						body: TEMPLATES.clinical_trial.contact_coordinator_body
					};

					$window.open(Mailto.url(recipient, options), "_self");

					return false; // Return false for IE
				};

				/**
				 * Search is for trial matching
				 */
				service.isTrialMatching = function() {
					return this.trialMatchingSearch;
				};

				service.setIsTrialMatching = function(isTrialMatching) {
					this.trialMatchingSearch = isTrialMatching;
				};

				function isNumeric(n) {
					return !isNaN(parseFloat(n)) && isFinite(n);
				}

				return service;
			}]);
