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
