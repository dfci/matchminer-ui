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
