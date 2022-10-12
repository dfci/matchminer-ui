/**
 * Service for the negative genomic data resource accessors
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('NegativeGenomicREST',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint, {
						where: '@query'
					},
					{
						'queryWhere': {
							'method': 'GET',
							'url': ENV.api.endpoint + '/negative_genomic:query',
							isArray: false
						}
					});
			}
		]);
