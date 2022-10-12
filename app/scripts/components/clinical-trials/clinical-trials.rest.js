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
