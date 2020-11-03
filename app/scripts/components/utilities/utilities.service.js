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
					field: '@field',
					panel: '@panel'
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
					},
					'getPanel': {
						method: 'GET',
						url: ENV.api.endpoint + '/utility/get_panel',
						isArray: false
					}
				});
			}
		]);
