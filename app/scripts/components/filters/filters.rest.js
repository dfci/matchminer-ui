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
	.factory('FiltersREST',
		['$http', '$resource', 'ENV', 'TokenHandler',
			function ($http, $resource, ENV, tokenHandler) {
				return $resource(ENV.api.endpoint + '/filter/:id', {
					'id': '@_id',
					'where': '@query',
					'sort': "@srt",
					'max_results': "@mr",
					'page': "@pg"
				}, {
					'findAll': {
						method: 'GET',
						isArray: false
					},
					'findByQuery': {
						method: 'GET',
						url: ENV.api.endpoint + '/filter:query:srt:mr:pg',
						isArray: false
					},
					'findOne': {
						method: 'GET',
						isArray: false
					},
					'updateGenomicFilter': {
						method: 'PUT',
						headers: {
							'If-Match': tokenHandler.get
						},
						isArray: false
					},
					'saveGenomicFilter': {
						method: 'POST',
						isArray: false
					}
				});
			}
		]);
