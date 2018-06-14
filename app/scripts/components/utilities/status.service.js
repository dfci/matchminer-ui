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

