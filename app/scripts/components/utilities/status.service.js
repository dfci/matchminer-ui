/**
 * Service for the generic utilities required for showing data
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('StatusService',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint + '/status', {
					resource: '@resource',
					field: '@field'
				}, {
					'query': {
						method: 'GET',
						isArray: false
					}
				});
			}
		]);

