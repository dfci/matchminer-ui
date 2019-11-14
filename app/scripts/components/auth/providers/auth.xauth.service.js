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
 * @name matchminerUiApp.factory:AuthServerProvider
 * @description
 * # AuthServerProvider
 * Authentication Provider of MatchMinerUI for SAML services
 */
angular.module('matchminerUiApp')
	.factory('AuthServerProvider', ['$http', '$log', '$q', '$window', 'ENV', '$state',
		function($http, $log, $q, $window, ENV, $state) {
			var service = {};

			//when the demo flag is enabled, it expects a demo user to
			//be present in the user collection. See README
			service.login = function () {
				if (ENV.demo) {
					window.location.reload()
				} else {
					$log.info("Logging in via Partners SAML");

					var deferred = $q.defer();
					$window.open(ENV.slsUrl, '_self');

					return deferred.promise;
				}

			};

			service.logout = function () {
				$log.info("Logging out of MatchMiner. Clearing local storage.");
				if (ENV.demo) {
					$state.go('home')
				} else {
					var deferred = $q.defer();
					$window.open(ENV.api.host + '?slo', '_self');
					return deferred.promise;
				}
			};

			return service;
		}]);
