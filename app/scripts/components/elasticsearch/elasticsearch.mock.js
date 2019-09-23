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
 * @Service ElasticSearchMocks
 * @Description Service layer exposing a mock layer for ElasticSearch operations.
 */
angular.module('matchminerUiApp')
    .factory('ElasticSearchMocks', ['$q',
        function ($q) {
            var service = {};

            service.mockMetadataResponse = function () {
                var res = {
                    hits: {
                        total: 50,
                        max_score: 1,
                        hits: []
                    },
                    took: 2,
                    timed_out: false
                };

                return res;
            };

            service.mockElasticResults = function () {
                var res = {};

                var hits = [];

                _.extend(res, this.mockMetadataResponse());
                res.hits = {};
                _.extend(res.hits, hits);
                res.aggregations = {};
                _.extend(res.aggregations, this.getAggregators());

                return res;
            };

            service.getSorter = function () {
                var res = {
                    status: {
                        order: 'desc'
                    }
                };

                return res;
            };

            service.getSearchQuery = function () {
                var res = {
                    "bool": {
                        "must_not": [],
                        "should": [],
                        "must": [
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "multi_match": {
                                                "query": "BRCA",
                                                "fields": [
                                                    "_elasticsearch.protocol_no^200.0",
                                                    "_elasticsearch.age",
                                                    "_elasticsearch.phase",
                                                    "_elasticsearch.disease_status",
                                                    "_elasticsearch.nct_number",
                                                    "_elasticsearch.disease_center",
                                                    "_elasticsearch.mmr_status",
                                                    "_elasticsearch.ms_status",
                                                    "_elasticsearch.short_title",
                                                    "_elasticsearch.drugs^2.0"
                                                ],
                                                "type": "most_fields"
                                            }
                                        },
                                        {
                                            "multi_match": {
                                                "query": "Trial",
                                                "fields": [
                                                    "_elasticsearch.protocol_no^200.0",
                                                    "_elasticsearch.age",
                                                    "_elasticsearch.phase",
                                                    "_elasticsearch.disease_status",
                                                    "_elasticsearch.nct_number",
                                                    "_elasticsearch.disease_center",
                                                    "_elasticsearch.mmr_status",
                                                    "_elasticsearch.ms_status",
                                                    "_elasticsearch.short_title",
                                                    "_elasticsearch.drugs^2.0"
                                                ],
                                                "type": "most_fields"
                                            }
                                        },
                                        {
                                            "match": {
                                                "_elasticsearch.investigator": "BRCA Trial"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                };
                return res;
            };

            service.getTemozolomideSearch = function () {
                var res = {
                    "bool": {
                        "must": [
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "multi_match": {
                                                "query": "Temozolomide Signature",
                                                "fields": [
                                                    "_elasticsearch.protocol_no^200.0",
                                                    "_elasticsearch.age",
                                                    "_elasticsearch.phase",
                                                    "_elasticsearch.disease_status",
                                                    "_elasticsearch.nct_number",
                                                    "_elasticsearch.disease_center",
                                                    "_elasticsearch.mmr_status",
                                                    "_elasticsearch.ms_status",
                                                    "_elasticsearch.short_title"
                                                ],
                                                "type": "most_fields"
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "must_not": [],
                        "should": []
                    }
                }

                return res
            }

            service.getAggregators = function () {
                var res = {
                    "gene_(mutant)": {
                        doc_count: 7,
                        "gene_(mutant)": {
                            buckets: [
                                {
                                    key: 'ABL1',
                                    doc_count: 5
                                },
                                {
                                    key: 'EGFR',
                                    doc_count: 2
                                }
                            ]
                        }
                    },
                    phase: {
                        doc_count: 8,
                        phase: {
                            buckets: [
                                {
                                    key: '1',
                                    doc_count: 3
                                },
                                {
                                    key: '2',
                                    doc_count: 5
                                }
                            ]
                        }
                    }
                };

                return res;
            };

            return service;
        }]);
