/**
 * Created by tamba on 8/21/17.
 */

/*
 * Copyright (c) 2017. Dana-Farber Cancer Institute. All rights reserved.
 *
 *  Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *
 * See the file LICENSE in the root of this repository.
 *
 * Contributing authors:
 * - tamba
 *
 */

/**
 * Service for the tracking data resource accessors
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('TrackingREST',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint, {},
					{
						'queryTrialMatchesTracking': {
							'method': 'POST',
							'url': ENV.api.endpoint + '/patient_view',
							isArray: false
						},
						'querySelectedTrialMatchTracking': {
							'method': 'POST',
							'url': ENV.api.endpoint + '/patient_view',
							isArray: false
						},
					});
			}
		]);


