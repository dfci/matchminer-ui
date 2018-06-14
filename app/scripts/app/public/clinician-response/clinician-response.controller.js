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
 * @ngdoc function
 * @name matchminerUiApp.controller:ClinicianResponseCtrl
 * @description
 * # ClinicianResponseCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('ClinicianResponseCtrl',
		['$stateParams', '$log', 'ClinicianResponseREST',
			function ($stateParams, $log, ClinicianResponseREST) {
				var cr = this;
				var rid = $stateParams.id;
				cr.isLoading = true;
				cr.deceasedEmail = "";

				cr.loadClinicianResponse = function(rid) {
					if (!rid) { return false; }

					ClinicianResponseREST.get({id: rid, no_ml: 'true'}).$promise.then( function(res) {
						cr.isLoading = false;
						cr.response = res;
					}, function(error) {
						cr.isLoading = false;
						cr.error = error;
						$log.warn("Err ",error);
					});
				};

				cr.loadClinicianResponse(rid);
			}]);
