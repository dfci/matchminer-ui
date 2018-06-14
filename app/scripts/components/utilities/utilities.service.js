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
 * Service for the generic utilities such as querying unique gene symbols and match counts.
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('UtilitiesService',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint + '/utility/unique', {
					resource: '@resource',
					field: '@field'
				}, {
					'queryUnique': {
						method: 'GET',
						isArray: false,
						cancellable: false
					},
					'countMatches': {
						method: 'GET',
						url: ENV.api.endpoint + '/utility/count_match',
						isArray: false
					}
				});
			}
		]);
