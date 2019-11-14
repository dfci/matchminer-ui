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
 * @name matchminerUiApp.controller:HomeCtrl
 * @description
 * # MainCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('HomeCtrl',
		['$stateParams', '$log', '$window', 'Principal', 'PublicStatisticsService', 'ENV',
			function ($stateParams, $log, $window, Principal, PublicStatisticsService, ENV) {
				var hc = this;

				hc.scroll = 0;
				hc.year = (new Date()).getFullYear();

				if ($stateParams.error) {
					hc.error = true;
					hc.errorMessage = $stateParams.errorMessage;
					hc.errorDetails = $stateParams.errorDetails;
				}

				hc.isAuthenticated = Principal.isAuthenticated();

				hc.applyForAccess = function () {
					$window.location.href = ENV.accessRequestFormLink;
				};

				/**
				 * Load public statistics
				 */

				hc.loadPublicStatistics = function() {
					PublicStatisticsService.get().$promise
						.then( function(res){
							if (res._items[0]) {
								hc.public_stats = res._items[0];
							}
						});
				};

				hc.loadPublicStatistics();
			}]);
