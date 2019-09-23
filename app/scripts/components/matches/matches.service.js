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
 * Service for the matching overview
 */

'use strict';

angular.module('matchminerUiApp')
    .factory('MatchesService',
        ['MatchesREST', '$q', 'TokenHandler', '$log', 'ToastService', 'UtilitiesService', 'MatchminerApiSanitizer', 'TrackingREST',
            function (MatchesREST, $q, tokenHandler, $log, ToastService, UtilitiesService, MatchminerApiSanitizer, TrackingREST) {
                var service = {};

                /**
                 * Mutational Signatures fields used on patient match page
                 */
                var signatures = [
                    {
                        id: 1,
                        name: 'MMR-Proficient',
                        key: 'MMR_STATUS',
                        value: 'Proficient (MMR-P / MSS)'
                    },
                    {
                        id: 2,
                        name: 'MMR-Deficient',
                        key: 'MMR_STATUS',
                        value: 'Deficient (MMR-D / MSI-H)'
                    },
                    {
                        id: 3,
                        name: 'Tobacco',
                        key: 'TABACCO_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 4,
                        name: 'TMZ',
                        key: 'TEMOZOLOMIDE_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 5,
                        name: 'PolE',
                        key: 'POLE_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 6,
                        name: 'APOBEC',
                        key: 'APOBEC_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 7,
                        name: 'UVA',
                        key: 'UVA_STATUS',
                        value: 'Yes'
                    }
                ];

                /**
                 * Fields used as metadata indicating pagination, sorting and max number of results
                 */
                var _TABLEOPTS = {
                    max_results: 10,
                    sort: '',
                    page: 1
                };

                /**
                 * Fields to filter for in the matches table
                 */
                var _TABLEFILTER = {
                    date: null,
                    filter: null
                };

                /**
                 * Fields to embed in the requested match resource
                 */
                var _EMBEDDED = {
                    FILTER_ID: 1,
                    CLINICAL_ID: 1,
                    VARIANTS: 1
                };

                /**
                 * Private utility methods
                 */

                /**
                 * Setup a promise to update the status of a match
                 * @param match - the match object
                 * @param newStat - the new status
                 * @returns Promise
                 * @private
                 */
                var _promiseToUpdateMatch = function (match, newStat) {
                    var deferred = $q.defer();

                    if (parseInt(newStat) != service.matchMap[match._id].MATCH_STATUS) {
                        // Use the tokenHandler to set the etag which needs updating.
                        tokenHandler.set(match._etag);
                        match.MATCH_STATUS = newStat;
                        // Sanitize eve match resource.
                        var m = MatchminerApiSanitizer.sanitizeEveResource(angular.copy(match), _EMBEDDED, false);
                        var mu = MatchesREST.updateMatch(m).$promise;

                        deferred.resolve(mu);
                    } else {
                        deferred.reject("Match status out of sync.");
                    }

                    return deferred.promise;
                };

                /**
                 * Escape common mongo query characters from a string.
                 * @param str - String to escape
                 * @returns String - the escaped string
                 * @private
                 */
                var _escapeRegExp = function (str) {
                    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                };

                /**
                 * Build a search filter query to be used by the search box
                 * @param queryString
                 * @returns the built query string
                 * @private
                 */
                var _buildFilterQuery = function (queryString) {
                    return [
                        {
                            'FILTER_NAME': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'PATIENT_MRN': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'TRUE_HUGO_SYMBOL': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'ONCOTREE_BIOPSY_SITE_TYPE': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'VARIANT_CATEGORY': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'ONCOTREE_PRIMARY_DIAGNOSIS_NAME': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        },
                        {
                            'VARIANT_CATEGORY': {
                                '$regex': '.*' + _escapeRegExp(queryString) + '.*',
                                '$options': "si"
                            }
                        }
                    ];
                };

                var _buildMatchQuery = function () {
                    var q = {
                        FILTER_STATUS: service.getFilterStatus(),
                        MATCH_STATUS: service.getMatchStatus(),
                        TEAM_ID: service.getTeamId()
                    };

                    var tableDate = service.getTableDate();
                    if (tableDate) {
                        // Build REPORT_DATE query.
                        var cd = new Date();
                        cd.setMonth(cd.getMonth() - parseInt(tableDate));
                        var dateQuery = {
                            '$gte': cd.toUTCString()
                        };

                        q.REPORT_DATE = {};
                        _.extend(q.REPORT_DATE, dateQuery);
                    }

                    var tableFilter = service.getTableFilters();
                    if (tableFilter && tableFilter.length) {
                        var filterQuery = {
                            '$in': tableFilter
                        };

                        q.FILTER_ID = {};
                        _.extend(q.FILTER_ID, filterQuery);
                    }

                    return q;
                };

                var _buildSortString = function () {
                    if (!service.tableOpts.sort) {
                        return null;
                    }

                    var order = service.tableOpts.sort;
                    var sortStr = order.charAt(0) == '-' ? order.substr(1) : order;
                    var ascdesc = order.charAt(0) == '-' ? -1 : 1;
                    return '[("' + sortStr + '", ' + ascdesc + ')]';
                };

                var _buildMatchSearch = function () {
                    // Clear search query
                    var matchSearch = {};

                    angular.forEach(service.matchSearchTerms, function (e) {
                        var queryArr = _buildFilterQuery(e);

                        // Extend array with querystring options
                        Array.prototype.push.apply(matchSearch, queryArr);
                    });

                    if (!service.matchSearchTerms || !service.matchSearchTerms.length) {
                        matchSearch = null;
                    }

                    return matchSearch;
                };

                service = {
                    isLoading: false,
                    tableOpts: _TABLEOPTS,
                    tableFilter: _TABLEFILTER,
                    matchCounts: {},
                    matchMap: {},
                    matchQuery: {},
                    matchSearchTerms: [],
                    matchOpts: {
                        FILTER_STATUS: 1,
                        MATCH_STATUS: 0,
                        TEAM_ID: null
                    },
                    selectedMatches: [],
                    matches: [],
                    lastResponse: null,
                    _promiseToUpdateMatch: _promiseToUpdateMatch,
                    _buildFilterQuery: _buildFilterQuery,
                    _buildMatchQuery: _buildMatchQuery,
                    _buildSortString: _buildSortString,
                    _buildMatchSearch: _buildMatchSearch
                };

                /**
                 * Public methods
                 */
                service.setFilterStatus = function (FILTER_STATUS) {
                    this.matchOpts.FILTER_STATUS = FILTER_STATUS;
                };

                service.getFilterStatus = function () {
                    return this.matchOpts.FILTER_STATUS;
                };

                service.setMatchStatus = function (MATCH_STATUS) {
                    this.matchOpts.MATCH_STATUS = MATCH_STATUS;
                };

                service.getMatchStatus = function () {
                    return this.matchOpts.MATCH_STATUS;
                };

                service.getFilters = function () {
                    return this.matchOpts.FILTER_ID;
                };

                service.setFilters = function (filterQuery) {
                    this.matchOpts.FILTER_ID = filterQuery;
                };

                service.setTeamId = function (TEAM_ID) {
                    this.matchOpts.TEAM_ID = TEAM_ID;
                };

                service.getTeamId = function () {
                    return this.matchOpts.TEAM_ID;
                };

                service.getMatches = function () {
                    return this.matches;
                };

                service.setMatches = function (matches) {
                    this.matches = matches;
                };

                service.getTableOpts = function () {
                    return this.tableOpts;
                };

                service.getSort = function () {
                    return this.tableOpts.sort;
                };

                service.setSort = function (order) {
                    this.tableOpts.sort = order;
                };

                service.getPage = function () {
                    return this.tableOpts.page;
                };

                service.setPage = function (page) {
                    this.tableOpts.page = page;
                };

                service.getPageSize = function () {
                    return this.tableOpts.max_results;
                };

                service.setPageSize = function (max_results) {
                    this.tableOpts.max_results = max_results;
                };

                service.getIsLoading = function () {
                    return this.isLoading;
                };

                service.setIsLoading = function (isLoading) {
                    this.isLoading = isLoading;
                };

                service.getMatchSearchTerms = function () {
                    return this.matchSearchTerms;
                };

                service.addMatchSearchTerm = function (term) {
                    this.matchSearchTerms.push(term);
                };

                service.removeMatchSearchTerm = function (term) {
                    var idx = this.matchSearchTerms.indexOf(term);
                    this.matchSearchTerms.splice(idx, 1);
                };

                service.getTableFilter = function () {
                    return this.tableFilter;
                };

                service.getTableDate = function () {
                    return this.tableFilter.date;
                };

                service.setTableDate = function (date) {
                    this.tableFilter.date = date;
                };

                service.getTableFilters = function () {
                    return this.tableFilter.filter;
                };

                service.setTableFilters = function (filters) {
                    this.tableFilter.filter = filters;
                };

                service.getLastResponse = function () {
                    return this.lastResponse;
                };

                service.setLastResponse = function (response) {
                    this.lastResponse = response;
                };

                service.fetchMatches = function (withMatchStatus, forced) {
                    if (withMatchStatus == service.getMatchStatus() && !forced) {
                        return $q.resolve(service.getLastResponse());
                    }

                    service.setIsLoading(true);

                    // Update query match status
                    service.setMatchStatus(+withMatchStatus);

                    // Reset matches
                    service.selectedMatches = [];

                    var _matchQuery = service._buildMatchQuery();
                    var _sort = service._buildSortString();
                    _matchQuery['$or'] = [];
                    _.extend(_matchQuery['$or'], service._buildMatchSearch());

                    if (_.isEmpty(_matchQuery['$or'])) {
                        delete _matchQuery['$or'];
                    }

                    return MatchesREST.findByStatus({
                        where: angular.toJson(_matchQuery),
                        embedded: angular.toJson(_EMBEDDED),
                        sort: _sort,
                        page: service.getPage(),
                        max_results: service.getPageSize()
                    }).$promise;
                };

                service.getCounts = function () {
                    return UtilitiesService.countMatches({}).$promise;
                };

                /**
                 * Build an aggregate count map for a set of filters
                 * @param result
                 * @param filters - The genomic filters
                 * @returns A map of all the match counts for all the filters
                 */
                service.getReducedCountMapForFilters = function (result) {
                    var cm = {};
                    var filters = this.tableFilter.filter;

                    // Aggregate count map
                    _.each(result, function (v, k) {
                        if (filters && filters.length && filters.indexOf(k) == -1) {
                            return;
                        }
                        _.mapObject(v, function (val, key) {
                            if (cm.hasOwnProperty(key)) {
                                cm[key] += val;
                            } else {
                                cm[key] = val;
                            }
                        });
                    });

                    return cm;
                };

                service.updateStatus = function (selectedMatches, newStat) {
                    if (!selectedMatches || !selectedMatches.length) {
                        $log.warn("No matches selected ", selectedMatches);
                        return false;
                    }

                    //Temporary value used for display only, breaks API
                    selectedMatches.forEach(function (match) {
                        delete match.MUTATIONAL_SIGNATURE
                    });

                    var updatePromises = [];

                    angular.forEach(selectedMatches, function (match) {
                        updatePromises.push(_promiseToUpdateMatch(match, newStat));
                    });

                    return $q.all(updatePromises);
                };

                service.updateMatchMap = function () {
                    service.matchMap = {};

                    angular.forEach(service.matches, function (m) {
                        service.matchMap[m._id] = angular.copy(m);
                    });

                    service.postFilterMatches();
                };

                service.postFilterMatches = function () {
                    service.matches.forEach(function (match) {
                        var q = {
                            'filter_match': true,
                            'mrn': match.PATIENT_MRN,
                            'from_details': false,
                            'filter_label': match.FILTER_ID.label,
                            'filter_protocol_no': match.FILTER_ID.protocol_id
                        };

                        //Add mutational signature value
                        //Complicated because MMR-Status and all the other signature indicators
                        // exist in the same level in hierarchy, need to add display val
                        var variant =  match.VARIANTS[0];
                        if (variant != null && variant.VARIANT_CATEGORY === 'SIGNATURE') {
                            for (var i = 0; i < signatures.length; i++) {
                                if (variant[signatures[i].key] === signatures[i].value) {
                                    if (match['FILTER_ID'].genomic_filter.hasOwnProperty('MMR_STATUS')) {
                                        match['MUTATIONAL_SIGNATURE'] = signatures[i].name;
                                        break;
                                    } else if (variant.hasOwnProperty(signatures[i].key) && signatures[i].key !== 'MMR_STATUS') {
                                        match['MUTATIONAL_SIGNATURE'] = signatures[i].name;
                                        break;
                                    }
                                }
                            }
                        }

                        TrackingREST.queryTrialMatchesTracking(q).$promise
                            .then(function (res) {
                            })
                            .catch(function (err) {
                                $log.warn("Error in tracking metrics ", err);
                            })
                    });
                };

                return service;
            }
        ]);
