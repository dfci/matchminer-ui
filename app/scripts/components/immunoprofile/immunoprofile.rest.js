/**
 * Service for the patient data resource accessors
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('ImmunoprofileREST',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint, {
						CLINICAL_ID: '@id',
						where: '@query',
						max_results: "@mr",
					},
					{
						'queryImmunoprofile': {
							'method': 'GET',
							'url': ENV.api.endpoint + '/immunoprofile/:query',
							isArray: false
						},
					});
			}
		]);

