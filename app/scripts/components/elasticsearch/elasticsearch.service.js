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

angular.module('matchminerUiApp')
	.factory('ElasticSearchService',
		['$q', '$log', 'esFactory', 'ENV',
			function ($q, $log, esFactory, ENV) {
				/**
				 * Instantiate a ElasticSearch factory with a predefined proxy from the properties
				 */
				var esUrl;

				if (ENV.name == 'development') {
					esUrl = ENV.elasticsearch.proxy;
				} else {
					esUrl = ENV.elasticsearch.host;
				}

				var esClient = esFactory({
					host: esUrl,
					apiVersion: '2.4'
				});

				var service = {};
				service.searchTerm = '';
				service.searchSuggestTerm = '';
				service.elasticOptions = {};
				service.patientSearchSize = null;

				service.init = function() {
					// Initialize some defaults.
					service.elasticOptions.index = ENV.elasticsearch.index;
					service.elasticOptions.type = 'trial';
					service.elasticBody = {};
					service.elasticBody.from = 0;
					service.elasticBody.size = 10;
					service.elasticBody.sort = [];
					service.elasticBody.bool = {};
					service.elasticBody.query = {};
					service.elasticBody.filter = {};
					service.elasticBody.aggs = null;
				};

				// Initialize on load
				service.init();

				// Reset base parameters
				service.reset = function(applyDefaultSort) {
					this.clearSearchSort();
					service.elasticBody.from = 0;
					service.elasticBody.size = 10;

					if (applyDefaultSort) {
						// Set default sorting fields
						// Descending by coordinating_center
						var coordinating_center_order = '_summary.site';

						this.setSearchSort(coordinating_center_order);

						// Descending by protocol_no
						var protocol_no_order = '-protocol_no';
						this.setSearchSort(protocol_no_order);
					}
				};

				/**
				 * Getter and setter methods at a service level in order to build te query
				 * in other service layers.
				 */

				/**
				 * Returns the ElasticSearch index used in querying the API
				 * @returns {*|string|number|Number}
				 */
				service.getSearchIndex = function () {
					return this.elasticOptions.index;
				};

				/**
				 * Sets the ElasticSearch index used in querying the API
				 * @param index
				 */
				service.setSearchIndex = function (index) {
					this.elasticOptions.index = index;
				};

				/**
				 * Returns the ElasticSearch collection (resource) used in querying the API
				 * @returns {*}
				 */
				service.getSearchType = function () {
					return this.elasticOptions.type;
				};

				/**
				 * Sets the ElasticSearch type used in querying the API
				 * @param type
				 */
				service.setSearchType = function (type) {
					this.elasticOptions.type = type;
				};

				/**
				 * Returns the query pagination offset
				 * @returns {*|number}
				 */
				service.getSearchFrom = function () {
					return this.elasticBody.from;
				};
				
				/**
				 * Sets the query pagination offset
				 * @param from
				 */
				service.setSearchFrom = function (from) {
					this.elasticBody.from = from;
				};

				/**
				 * Get the query pagination page size
				 * @returns {*|number|Number|string}
				 */
				service.getSearchSize = function () {
					return this.elasticBody.size;
				};

				service.setPatientSearchSize = function(size) {
					this.patientSearchSize = size;
				}
				
				service.getPatientSearchSize = function() {
					return this.patientSearchSize;
				}

                service.resetPatientSearchSize = function() {
                    this.patientSearchSize = null;
                }

                /**
				 * Sets the query pagination page size
				 * @param size
				 */
				service.setSearchSize = function (size) {
					this.elasticBody.size = size;
				};

				/**
				 * Does the service have set search aggregators
				 * to be used in the query
				 * @returns {boolean}
				 */
				service.hasSearchAggregators = function () {
					return this.elasticBody.aggs != null;
				};

				/**
				 * Get the search aggregators
				 * @returns {*|null}
				 */
				service.getSearchAggregators = function () {
					return this.elasticBody.aggs;
				};

				/**
				 * Set the search aggregators
				 * @param aggs
				 */
				service.setSearchAggregators = function (aggs) {
					this.elasticBody.aggs = aggs;
				};

				/**
				 * Does the service have set search filters
				 * to be used in the query
				 * @returns {boolean}
				 */
				service.hasSearchFilters = function () {
					var f = this.elasticBody.filter;
					return f != null && !_.isEmpty(f) && f.length > 0;
				};

				/**
				 * Fetch the search filters used in the query
				 * @returns {service.elasticBody.filter|{}}
				 */
				service.getSearchFilters = function () {
					return this.elasticBody.filter;
				};

				/**
				 * Set an array of search filters
				 * formatted according to ElasticSearch API format
				 * @param filters
				 */
				service.setSearchFilters = function (filters) {
					this.elasticBody.filter = filters;
				};

				/**
				 * Check if a search term has been set.
				 * @returns {boolean}
				 */
				service.hasSearchTerm = function () {
					var terms = [this.getSearchTerm(), this.getGeneSearchTerm(), this.getTumorTypeSearchTerm(), this.getDiseaseCenterSearchTerm()];
					return _.some(_.flatten(terms.map(function(term){return term !== null && term !== undefined && term != '';})))
				};
				
				service.hasSpecificSearchTerm = function (type) {
					var term;
					if (!type) {
						term = this.getSearchTerm();
					} else term = this['get' + type + 'SearchTerm']();
					return term !== null && term !== undefined && term != '';
				};
				

				/**
				 * Fetch the set search term
				 * @returns {String}
				 */
				service.getSearchTerm = function () {
					return this.searchTerm;
				};
				service.getGeneSearchTerm = function () {
					return this.geneSearchTerm;
				};
				service.getTumorTypeSearchTerm = function () {
					return this.tumorTypeSearchTerm;
				};
				service.getDiseaseCenterSearchTerm = function () {
					return this.diseaceCenterSearchTerm;
				};
				

				/**
				 * Set the search term
				 * @param {String} searchTerm
				 */
				service.setSearchTerm = function (searchTerm) {
					this.searchTerm = searchTerm;
				};
				service.setGeneSearchTerm = function (searchTerm) {
					this.geneSearchTerm = searchTerm;
				};
				service.setTumorTypeSearchTerm = function (searchTerm) {
					this.tumorTypeSearchTerm = searchTerm;
				};
				service.setDiseaseCenterSearchTerm = function (searchTerm) {
					this.diseaceCenterSearchTerm = searchTerm;
				};
				
				service.resetSearchTerms = function() {
					this.searchTerm = "";
					this.geneSearchTerm = "";
					this.tumorTypeSearchTerm = "";
					this.diseaceCenterSearchTerm = "";
				}
				
				/**************************************************************************
				 */

				/**
				 * Check if a search suggest term has been set.
				 * @return {boolean}
				 */
				service.hasSearchSuggestTerm = function() {
					var suggestion = this.getSearchSuggestTerm();
					return suggestion !== null && suggestion !== undefined && suggestion != '';
				};

				/**
				 * Fetch the search suggest term
				 * @returns {String}
				 */
				service.getSearchSuggestTerm = function() {
					return this.searchSuggestTerm;
				};

				/**
				 * Set the search suggest term
				 * @param {String} searchSuggestTerm
				 */
				service.setSearchSuggestTerm = function (searchSuggestTerm) {
					this.searchSuggestTerm = searchSuggestTerm;
				};

                /**
				 *
                 * @param {Array} searchTerm: Search Term input to Advanced search box
                 * @returns {Array} searchTermNGrams: List of 1-2 ngrams from searchTerm list
                 */
				service.getInvestigatorSearchTerms = function (searchTerm) {
					var investigatorSearchTerm = [];
					for (var i=0; i < searchTerm.length; i++) {
						var term = searchTerm[i];
						if (searchTerm[i+1] !== undefined) {
                            var nextTerm = term + ' ' + searchTerm[i+1];
                            investigatorSearchTerm.push(nextTerm);
						}
					}
					return investigatorSearchTerm;
				};

				/**
				 * Format the searchQuery field based on the set searchTerm
				 * to correctly format the query body object.
				 */
				service.getSearchQuery = function () {
				    
				    var partialQuery = {
				        'bool': {
				            'must': [],
				            'must_not': [],
				            'should': []
				        }
				    };

				    if (this.hasSpecificSearchTerm()) {
						var fullSearchTerm = this.getSearchTerm();
						var splitSearchTerm = [fullSearchTerm];
						var isTemozolomide = false;
						if (fullSearchTerm.toLowerCase() === 'temozolomide signature') {
							splitSearchTerm = fullSearchTerm.split(' ');
							isTemozolomide = true;
						}
						var investigatorSearchTerm = this.getInvestigatorSearchTerms(splitSearchTerm);
						partialQuery.bool.must.push({'bool': {'should': []}});
						for (var i=0; i < splitSearchTerm.length; i++) {
							var multi_match = {
                                    'query': splitSearchTerm[i],
                                    'fields': [
                                        '_elasticsearch.protocol_no^200.0',
                                        '_elasticsearch.age',
                                        '_elasticsearch.phase',
                                        '_elasticsearch.disease_status',
                                        '_elasticsearch.nct_number',
                                        '_elasticsearch.disease_center',
                                        '_elasticsearch.mmr_status',
                                        '_elasticsearch.ms_status',
                                        '_elasticsearch.short_title',
										'_elasticsearch.drugs^2.0'
                                    ],
                                    'type': 'most_fields'
                                };

							if (isTemozolomide) {
								//remove _elasticsearch.drugs^2.0 from search if
								// temozomolide signature if passed as a search term
								multi_match.fields.pop()
							}

                            partialQuery.bool.must[0].bool.should.push({
                                'multi_match': multi_match
                            });
                        }
						for (var j=0; j < investigatorSearchTerm.length; j++) {
                            partialQuery.bool.must[0].bool.should.push({
                                'match': {
                                    '_elasticsearch.investigator': investigatorSearchTerm[j]
                                }
                            });
						}
					}

					if (this.hasSpecificSearchTerm('Gene')) {
						var fullGeneSearchTerm = this.getGeneSearchTerm();

						// map suggestions back to the appropriate query term
						if (fullGeneSearchTerm.endsWith('Wild-Type')) {
							fullGeneSearchTerm = fullGeneSearchTerm.split(' ')[0] + ' wt';
						} else if (fullGeneSearchTerm.endsWith('All Variants')) {
							fullGeneSearchTerm = fullGeneSearchTerm.split(' ')[0];
						}

                        if (fullGeneSearchTerm.endsWith('wt')) {
                            partialQuery.bool.must.push({
                                'match': {
                                    '_elasticsearch.wildtype_genes': fullGeneSearchTerm
                                }
                            });
                        } else if (fullGeneSearchTerm.endsWith('CNV')) {
                            partialQuery.bool.must.push({
								'match': {
                                    '_elasticsearch.cnv_genes': fullGeneSearchTerm
                                }
                            });
                        } else if (fullGeneSearchTerm.endsWith('SV')) {
                            partialQuery.bool.must.push({
                                'match': {
                                    '_elasticsearch.sv_genes': fullGeneSearchTerm
								}
                            });
                        } else {
                            var geneSearchTerm = fullGeneSearchTerm.split(' ');
                            if (geneSearchTerm.length > 1) {
                                partialQuery.bool.must.push({
                                    'bool': {
                                        'should': [
                                            {
                                                'match': {
                                                    '_elasticsearch.variants': geneSearchTerm[0] + " any"
                                                }
                                            },
                                            {
                                                'match': {
                                                    '_elasticsearch.variants': {
                                                        'query': fullGeneSearchTerm,
                                                        'boost': 10
                                                    }
                                                }
                                            },
                                            {
                                                'match': {
                                                    '_elasticsearch.variants': {
                                                        'query': fullGeneSearchTerm.slice(0, -1),
                                                        'boost': 5
                                                    }
                                                }
                                            }
                                        ],
                                        "minimum_number_should_match": 1
                                    }
                                });
                                partialQuery.bool.must_not.push({
                                    'match': {
                                        '_elasticsearch.exclusion_genes': fullGeneSearchTerm
                                    }
                                });
							} else {
                                partialQuery.bool.must.push({
                                    'match': {
                                        '_elasticsearch.genes': geneSearchTerm[0]
                                    }
                                });
							}
                        }

					}

					if (this.hasSpecificSearchTerm('DiseaseCenter')) {
						var fullDiseaseCenterSearchTerm = this.getDiseaseCenterSearchTerm();
						partialQuery.bool.must.push({
							'match': {
								'_elasticsearch.disease_center': fullDiseaseCenterSearchTerm
							}
						});
					}

					if (this.hasSpecificSearchTerm('TumorType')) {
						var fullTumorTypeSearchTerm = this.getTumorTypeSearchTerm();

						if (fullTumorTypeSearchTerm === 'All Solid Tumors') {
							fullTumorTypeSearchTerm = '_SOLID_'
						} else if (fullTumorTypeSearchTerm === 'All Liquid Tumors') {
							fullTumorTypeSearchTerm = '_LIQUID_'
						}

						partialQuery.bool.must.push({
							'match': {
								'_elasticsearch.tumor_types': fullTumorTypeSearchTerm
							}
						});

						if (fullTumorTypeSearchTerm !== '_SOLID_' && fullTumorTypeSearchTerm !== '_LIQUID_') {
							partialQuery.bool.should.push({
								'bool': {
									'must_not': [
										{
											'match': {
												'_elasticsearch.tumor_types': '_SOLID_'
											}
										},
										{
											'match': {
												'_elasticsearch.tumor_types': '_LIQUID_'
											}
										}
									]
								}
							});
						}
					}

					return partialQuery;
				};

				/**
				 * Check if a search sort has been set.
				 * @returns {boolean}
				 */
				service.hasSearchSort = function () {
					var sort = this.getSearchSort();
					return sort !== null && sort.length > 0;
				};

				/**
				 * Check if the current search sort is the default
				 * @returns {boolean}
				 */
				service.isDefaultSearchSort = function() {
					var defaultSort = [
						{
							'_summary.site': {
								order: 'asc'
							}
						},
						{
							'protocol_no': {
								order: 'desc'
							}
						}
					];

					var currentSort = this.getSearchSort();

					return _.isEqual(defaultSort, currentSort);
				};

				/**
				 * Fetch the set sorting fields from the
				 * ElasticSearch query object.
				 * @returns {*|string|Document.sort|Array|string}
				 */
				service.getSearchSort = function () {
					return this.elasticBody.sort;
				};

				/**
				 * Transform a simple string describing the document property field
				 * possibly prefixed by a '-' to indicate a descending sort.
				 * Defaults to an ascending sort.
				 * @param {String} order indicating search field, possibly prefixed by a '-'.
				 * @example '-status' or 'phase'
				 * @returns {null}
				 */
				service.setSearchSort = function (order) {
					if (!order) {
						return null;
					}

					var sortStr = order.charAt(0) == '-' ? order.substr(1) : order;
					var ascdesc = order.charAt(0) == '-' ? 'desc' : 'asc';
					var sortObj = {};
					sortObj[sortStr] = {};
					sortObj[sortStr].order = ascdesc;
					this.elasticBody.sort.push(sortObj);
				};

				/**
				 * Clear the set sorting fields
				 */
				service.clearSearchSort = function() {
					this.elasticBody.sort = [];
				};

				/**
				 * Does the search service have a sourcefilter to subset the source
				 */
				service.hasSourceFilter = function() {
					var sourceFilter = this.getSourceFilter();
					return sourceFilter !== null;
				};

				/**
				 * Set a source filter
				 * A query.bool syntax holds:
				 * - 'must' (inclusion criteria)
				 * - 'must_not' (exclusion criteria)
				 */
				service.setSourceFilter = function(sourceFilter) {
					var criteria = {};

					if (sourceFilter && sourceFilter.must) {
						var inclusion = {
							'terms': {}
						};

						criteria.must = {};

						inclusion.terms[sourceFilter.must.key] = sourceFilter.must.values;
						_.extend(criteria.must, inclusion);
					}

					if (sourceFilter && sourceFilter.must_not) {
						var exclusion = {
							'terms': {}
						};
						criteria.must_not = {};
						exclusion.terms[sourceFilter.must_not.key] = sourceFilter.must_not.values;
						_.extend(criteria.must_not, exclusion);
					}

					this.elasticBody.bool = sourceFilter ? criteria : null;
				};

				/**
				 * Fetch the source filters
				 */
				service.getSourceFilter = function() {
					return this.elasticBody.bool;
				};

				/**
				 * Perform an elastic search with a built query
				 * Query is automatically built up from the set fields
				 * If no searchTerm has been set, all documents will be
				 * queried, subsetted by the size and page defaults
				 * @returns promise
				 */
				service.search = function () {
					$log.info("Performing search!");
					var params = {
						index: this.getSearchIndex(),
						type: this.getSearchType(),
						body: {
							"size": (this.getPatientSearchSize() || this.getSearchSize() || 0),
							"from": (this.getSearchFrom() || 0),
							"highlight" : {
								"fields" : {
									"*": {
										type : "plain",
										term_vector: "with_positions_offsets"
									}
								},
								require_field_match: true
							}
						}
					};

					/**
					 * Search specific field for values using an exact matcher
					 * Arg: {
					 *    key: # property to match with
					 *    values: # array or value to match
					 * }
 					 */
					if (this.hasSourceFilter()) {
						params.body.query = {
							bool: {}
						};

						var sourceFilter = this.getSourceFilter();

						// Add In- / exclusion criteria
						if (sourceFilter) {
							params.body.query.bool = sourceFilter;
						}
					}

					// Apply search term, else leave it out and resolve all results.
					if (this.hasSearchTerm() && !this.hasSourceFilter()) {
						params.body.query = {};
						_.extend(params.body.query, this.getSearchQuery());
					}

					// Apply sorting.
					if (this.hasSearchSort()) {
						_.extend(params.body, {'sort': this.getSearchSort()});
					}

					// Apply aggregators for collecting filters.
					if (this.hasSearchAggregators()) {
						_.extend(params.body, {'aggs': this.getSearchAggregators()});
					}

					// Apply filters to query.
					if (this.hasSearchFilters()) {
						_.extend(params.body, {"filter":  {}});

						params.body.filter.and = this.getSearchFilters();
					}

					return esClient.search(params);
				};

				/**
				 * Perform a suggest query based on an input string
				 */
				service.suggest = function(fields) {
					if (!service.hasSearchSuggestTerm()){
						return $q.resolve([]);
					}

					$log.info("Performing suggest! ");
					// Make sure argument is an array
					var suggestFields = fields;

					if (suggestFields.indexOf("hugo_symbol_suggest") > -1) {
						suggestFields.push("wildtype_suggest");
						suggestFields.push("cnv_suggest");
						suggestFields.push("sv_suggest");
                        suggestFields.push("variant_suggest");
					}
					if (!_.isArray(fields)) {
						suggestFields = [fields]
					}

					var suggestQuery = {};
					_.each(suggestFields, function(f) {

                        var suggestTxt = service.getSearchSuggestTerm();

						var suggestField = "_suggest."+f;
						suggestQuery[f] = {
							"text": suggestTxt,
							"completion": {
								"field": suggestField,
								"size": 200
							}
						};
					});

					var params = {
						index: this.getSearchIndex(),
						type: this.getSearchType(),
						body: {
							"_source": "protocol_no",
							"suggest": {}
						}
					};

					_.extend(params.body.suggest, suggestQuery);

					return esClient.search(params);
				};

				return service;
			}]);

