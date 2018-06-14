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

'use strict';
/**
 * @Service ClinicianResponseMocks
 * @Description Service layer exposing mock clinician response
 */
angular.module('matchminerUiApp')
	.factory('ClinicianResponseMocks',
		function () {
			var service = {};

			/**
			 * Possible return statuses:
			 * - yes
			 * - no
			 * - deferred
			 * - deceased
			 */
			service.mockResponse = function() {
				return {
					status: 'yes',
					response_recorded: 'Patient is eligible for trial enrolment',
					clinical_trial_id: 12-345
				};
			};

			service.mockResponseErr = function() {
				return {
					error: true,
					message: "An error occurred while fetching the clinician response: xyz"
				}
			};

			return service;
		});

