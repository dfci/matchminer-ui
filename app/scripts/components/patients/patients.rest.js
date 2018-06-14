/*
 * Copyright (c) 2017. Dana-Farber Cancer Institute. All rights reserved.
 *
 *  Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *
 * See the file LICENSE in the root of this repository.
 *
 * Contributing authors:
 * - berndvdveen
 *
 */

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

