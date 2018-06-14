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
	.factory('AuthServerProvider', ['$http', '$log', '$q', '$window', 'ENV',
		function($http, $log, $q, $window, ENV) {
			var service = {};

			service.login = function () {
				$log.info("Logging in via Partners SAML");

				var deferred = $q.defer();
				$window.open(ENV.slsUrl, '_self');

				return deferred.promise;
			};

			service.logout = function () {
				$log.info("Logging out of MatchMiner. Clearing local storage.");

				var deferred = $q.defer();
				$window.open(ENV.api.host + '?slo', '_self');

				return deferred.promise;
			};

			return service;
		}]);
