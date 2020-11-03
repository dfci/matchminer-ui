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

