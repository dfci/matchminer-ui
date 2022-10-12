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
				if (ENV.devUser) {
					var deferred = $q.defer();
					window.location.reload();
					return deferred.promise;
				} else {
					$log.info("Logging in via Partners SAML");

					var deferred = $q.defer();
					$window.open(ENV.slsUrl, '_self');

					return deferred.promise;
				}

			};

			service.logout = function () {
				$log.info("Logging out of MatchMiner. Clearing local storage.");
				if (ENV.devUser) {
					$state.go('home')
				} else {
					var deferred = $q.defer();
					$window.open(ENV.api.host + '?slo', '_self');
					return deferred.promise;
				}
			};

			return service;
		}]);
