'use strict';

angular.module('matchminerUiApp')
    .factory('ElasticSearchService',
        ['$q', '$log', 'esFactory', 'ENV',
            function ($q, $log, esFactory, ENV) {
                /**
                 * Instantiate a ElasticSearch factory with a predefined proxy from the properties
                 */
                var esUrl = ENV.elasticsearch.proxy;

                var esClient = esFactory({
                    host: esUrl,
                    apiVersion: '6.5'
                });

                var service = {};
                service.searchTerm = '';
                service.searchSuggestTerm = '';
                service.elasticOptions = {};
                service.patientSearchSize = null;

                service.init = function () {
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
                    service.metadata = {tumor_type_sort_order: []};
                    service.setMetadata();
                };


                // Reset base parameters
                service.reset = function (applyDefaultSort) {
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

                service.setPatientSearchSize = function (size) {
                    this.patientSearchSize = size;
                }

                service.getPatientSearchSize = function () {
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
                    _.each(this.elasticBody.aggs, function (agg) {
                        if (agg.hasOwnProperty("filter") && !agg.filter.hasOwnProperty('match_all')) {
                            var top = {
                                bool: {
                                    must: []
                                }
                            };
                            _.each(agg.filter.and, function (ft) {
                                if (ft.hasOwnProperty('or')) {
                                    var ftt = {
                                        bool: {
                                            should: []
                                        }
                                    };
                                    _.each(ft.or, function (or) {
                                        ftt.bool.should.push(or);
                                    });
                                    top.bool.must.push(ftt);
                                } else {
                                    top.bool.must.push(ft)
                                }
                            });
                            agg.filter = top;
                        }
                    });
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
                    var item = {
                        must: []
                    };
                    _.each(this.elasticBody.filter, function (ft) {
                        item.must.push({
                            bool: {
                                should: ft.or
                            }
                        });
                    });
                    return item;
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
                    return _.some(_.flatten(terms.map(function (term) {
                        return term !== null && term !== undefined && term != '';
                    })))
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

                service.resetSearchTerms = function () {
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
                service.hasSearchSuggestTerm = function () {
                    var suggestion = this.getSearchSuggestTerm();
                    return suggestion !== null && suggestion !== undefined && suggestion != '';
                };

                /**
                 * Fetch the search suggest term
                 * @returns {String}
                 */
                service.getSearchSuggestTerm = function () {
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
                    for (var i = 0; i < searchTerm.length; i++) {
                        var term = searchTerm[i];
                        if (searchTerm[i + 1] !== undefined) {
                            var nextTerm = term + ' ' + searchTerm[i + 1];
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
                        var splitSearchTerm = fullSearchTerm.split(' ');
						var isTemozolomide = false;
						if (fullSearchTerm.toLowerCase() === 'temozolomide signature') {
							//Don't search for temozolomide and signature as separate terms
							splitSearchTerm = [fullSearchTerm];
							isTemozolomide = true;
						}
                        var investigatorSearchTerm = this.getInvestigatorSearchTerms(splitSearchTerm);
                        partialQuery.bool.must.push({'bool': {'should': []}});
                        for (var i = 0; i < splitSearchTerm.length; i++) {


                            //TODO finish elastic search
                            // partialQuery.bool.must = [];
                            // partialQuery.bool.must.push({
                            // 	'terms' : {
                            // 		'_elasticsearch.protocol_no' : user_input
                            // 	}
                            // });

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
                        for (var j = 0; j < investigatorSearchTerm.length; j++) {
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
                                        ]
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
                service.isDefaultSearchSort = function () {
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
                service.clearSearchSort = function () {
                    this.elasticBody.sort = [];
                };

                /**
                 * Does the search service have a sourcefilter to subset the source
                 */
                service.hasSourceFilter = function () {
                    var sourceFilter = this.getSourceFilter();
                    return sourceFilter !== null;
                };

                /**
                 * Set a source filter
                 * A query.bool syntax holds:
                 * - 'must' (inclusion criteria)
                 * - 'must_not' (exclusion criteria)
                 */
                service.setSourceFilter = function (sourceFilter) {
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
                service.getSourceFilter = function () {
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
                            "highlight": {
                                "fields": {
                                    "*": {
                                        type: "plain"
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
                        _.extend(params.body, {"filter": {}});

                        params.body.filter.and = this.getSearchFilters();
                    }
                    var results = [];
                    var searchParams = $.extend(true, {}, params);
                    delete searchParams.body.filter;
                    results.push(esClient.search(searchParams));
                    // Apply filters to query.
                    if (this.hasSearchFilters()) {
                        if (!searchParams.body.hasOwnProperty("query")) {
                            searchParams.body.query = {bool: {must: {match_all: {}}}}
                        }
                        if (!searchParams.body.query.hasOwnProperty("bool")) {
                            searchParams.body.query.bool = {must: {match_all: {}}}
                        }
                        if (!searchParams.body.query.bool.hasOwnProperty("filter")) {
                            searchParams.body.query.bool.filter = {bool: {}}
                        }

                        searchParams.body.query.bool.filter.bool = $.extend(true, {}, this.getSearchFilters());
                        if (searchParams.body.query.bool.filter.bool.hasOwnProperty("must")) {
                            _.each(searchParams.body.query.bool.filter.bool.must, function (term) {
                                if (term.hasOwnProperty("bool")) {
                                    if (term.bool.hasOwnProperty("should")) {
                                        var phase_summary_list = [];
                                        _.each(term.bool.should, function (shouldItem) {
                                            if (shouldItem.hasOwnProperty("terms")) {
                                                if (shouldItem.terms.hasOwnProperty("_summary.phase_summary")) {
                                                    var item = shouldItem.terms["_summary.phase_summary"][0]
                                                    if (phase_summary_list.indexOf(item) === -1) {
                                                       phase_summary_list.push(item)
                                                    }
                                                }
                                            }
                                        });
                                        if ((phase_summary_list.indexOf("I") > -1) && (phase_summary_list.indexOf("I/II") === -1)) {
                                            phase_summary_list.push("I/II")
                                        }
                                        if ((phase_summary_list.indexOf("II") > -1) && (phase_summary_list.indexOf("I/II") === -1)) {
                                            phase_summary_list.push("I/II")
                                        }
                                        if ((phase_summary_list.indexOf("II") > -1) && (phase_summary_list.indexOf("II/III") === -1)) {
                                            phase_summary_list.push("II/III")
                                        }
                                        if ((phase_summary_list.indexOf("III") > -1) && (phase_summary_list.indexOf("II/III") === -1)) {
                                            phase_summary_list.push("II/III")
                                        }
                                        if (phase_summary_list.length > 0) {
                                            _.each(phase_summary_list, function (item) {
                                                term.bool.should.push({"terms": {"_summary.phase_summary": [item]}})
                                            })
                                        }
                                    }
                                }
                            })

                        }
                        results.push(esClient.search(searchParams));
                    }

                    return Promise.all(results);
                };

                service.setMetadata = function () {
                    esClient.indices.getMapping({index: service.elasticOptions.index}, function (error, result) {
                        var trial_mapping = result[service.elasticOptions.index].mappings.trial;
                        if (trial_mapping.hasOwnProperty('_meta')) {
                            service.metadata = trial_mapping._meta;
                        }
                    });
                };

                /**
                 * Perform a suggest query based on an input string
                 */
                service.suggest = function (fields) {
                    if (!service.hasSearchSuggestTerm()) {
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

                    var source_map = {
                        "cancer_type_suggest": "_elasticsearch.tumor_types",
                        "hugo_symbol_suggest": "_elasticsearch.genes",
                        "wildtype_suggest": "_elasticsearch.wildtype_genes",
                        "cnv_suggest": "_elasticsearch.cnv_suggest",
                        "sv_suggest": "_elasticsearch.sv_suggest",
                        "variant_suggest": "_elasticsearch.variants",
                        "disease_center_suggest": "_elasticsearch.disease_center",
                        "protocol_no_suggest": "protocol_no",
                        "drug_suggest": "_elasticsearch.drugs",
                        "disease_status_suggest": "_elasticsearch.disease_status",
                        "mmr_status_suggest": "_elasticsearch.mmr_status",
                        "nct_number_suggest": "_elasticsearch.mct_number",
                        "investigator_suggest": "_elasticsearch.investigator"
                    };
                    var results = [];
                    var index = this.getSearchIndex();
                    var type = this.getSearchType();
                    _.each(suggestFields, function (f) {

                        var suggestTxt = service.getSearchSuggestTerm();
                        var suggestField = "_suggest." + f;

                        var params = {
                            index: index,
                            type: type,
                            body: {
                                "_source": source_map[f],
                                "suggest": {}
                            }
                        };

                        params.body.suggest[f] = {
                            "text": suggestTxt,
                            "completion": {
                                "field": suggestField,
                                "size": 50
                            }
                        };
                        results.push(esClient.search(params));
                    });
                    return Promise.all(results)
                };

                // Initialize on load
                service.init();
                return service;
            }]);
