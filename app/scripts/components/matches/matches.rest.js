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
	.factory('MatchesREST',
		['$resource', 'ENV', 'TokenHandler',
			function ($resource, ENV, tokenHandler) {
				return $resource(ENV.api.endpoint + '/match/:id', {
					id: "@_id",
					where: "@query",
					embedded: "@embed", // What fields have to be populated by the API
					sort: "@srt",
					max_results: "@mr",
					page: "@pg"
				}, {
					'findMatch': {
						method: 'GET',
						isArray: false
					},
					'findByStatus': {
						method: 'GET',
						url: ENV.api.endpoint + '/match:query:embed:srt:mr:pg',
						isArray: false
					},
					'updateMatch': {
						method: 'PUT',
						headers: {
							'If-Match': tokenHandler.get
						},
						isArray: false
					}
				});
			}
		]);
