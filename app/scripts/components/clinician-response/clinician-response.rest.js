/**
 * Service for the Response resource
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('ClinicianResponseREST',
		['$resource', 'ENV',
			function ($resource, ENV) {
				return $resource(ENV.api.endpoint + '/response/:id', {
					id: '@id'
				});
			}
		]);
