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
 * Service for the filter resource
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('ElasticSearchREST',
		['$resource', 'ENV',
			function ($resource, ENV) {
				return $resource(ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index, {}, {
					'findTrialsBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/trial/_search',
						isArray: false
					},
					'findGenomicFiltersBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/genomic/_search',
						isArray: false
					},
					'findClinicalBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/clinical/_search',
						isArray: false
					}
				});
			}
		]);
