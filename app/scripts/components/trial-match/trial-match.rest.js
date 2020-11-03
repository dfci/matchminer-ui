/**
 * REST Service for retrieving the trial belonging to matches
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('TrialMatchREST',
		['$resource', 'ENV',
			function ($resource, ENV) {
				return $resource(ENV.api.endpoint, {
					id: "@id",
					where: "@query"
				}, {
					'query': {
						method: 'GET',
						url: ENV.api.endpoint + '/trial_match:query',
						isArray: false
					}
				});
			}
		]);
