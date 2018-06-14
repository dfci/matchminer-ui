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
	.factory('ClinicalTrialsREST',
		['$resource', 'ENV',
			function ($resource, ENV) {
				return $resource(ENV.api.endpoint + '/trial/:id', {
					id: '@protocol_no',
					where: '@query',
					sort: "@srt",
					max_results: "@mr",
					page: "@pg"
				}, {
					'findAll': {
						method: 'GET',
						isArray: false
					},
					'findBy': {
						method: 'GET',
						url: ENV.api.endpoint + '/trial:srt:mr:pg',
						isArray: false
					},
					'findById': {
						method: 'GET',
						url: ENV.api.endpoint + '/trial/:query',
						isArray: false
					}
				});
			}
		]);
