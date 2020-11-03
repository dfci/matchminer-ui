/**
 * Service for the patient data resource accessors
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('PatientsREST',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint, {
						CLINICAL_ID: '@id',
						where: '@query',
						sort: "@srt",
						max_results: "@mr",
						page: "@pg"
					},
					{
						'queryClinical': {
							'method': 'GET',
							'url': ENV.api.endpoint + '/clinical/:id',
							isArray: false
						},
						'queryClinicalSearch': {
							'method': 'GET',
							'url': ENV.api.endpoint + '/clinical:query:srt:mr:pg',
							isArray: false
						},
						'queryGenomic': {
							'method': 'GET',
							'url': ENV.api.endpoint + '/genomic:query',
							isArray: false
						}

					});
			}
		]);

