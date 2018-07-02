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

angular.module('matchminerUiApp')
	.factory('Auth', ['$rootScope', '$state', '$q', '$log', 'Principal', 'AuthServerProvider',
		function ($rootScope, $state, $q, $log, Principal, AuthServerProvider) {
			var auth_service = {};

			auth_service.login = function(callback) {
				var cb = callback || angular.noop;
				var deferred = $q.defer();

				AuthServerProvider.login().then(function (data) {
					// retrieve the logged account information
					Principal.identity(true).then(function (account) {
						deferred.resolve(account);
					});
					return cb();
				}).catch(function (err) {
					auth_service.logout();
					deferred.reject(err);
					return cb(err);
				}.bind(this));

				return deferred.promise;
			};

			auth_service.logout = function () {
				AuthServerProvider.logout();
				Principal.authenticate(null);
			};

			auth_service.authorize = function(force) {
				return Principal.identity(force)
					.then(function () {
						var isAuthenticated = Principal.isAuthenticated();

						/**
						 * Check whether authorities are defined for the state navigated to.
						 * If there are authorities defined, check if user has permission.
						 */
						if ($rootScope.toState.data.authorities && $rootScope.toState.data.authorities.length > 0 && !Principal.hasAnyAuthority($rootScope.toState.data.authorities)) {
							if (isAuthenticated) {
								// user is signed in but not authorized for desired state
								$state.go('home', {
									error: true,
									errorMessage: 'You are currently not authorized to access this page.',
									errorDetails: 'If you believe this is incorrect, please contact the developers.'
								});
							} else {
								// user is not authenticated. stow the state they wanted before you
								// send them to the signin state, so you can return them when you're done
                                $log.info('user not authenticated');
								$rootScope.previousStateName = $rootScope.toState;
								$rootScope.previousStateNameParams = $rootScope.toStateParams;

                                localStorage.setItem('afterAuthRedirectURL', window.location.href);
                                auth_service.login();
							}
						}

						if ($rootScope.toState.name == 'home' && isAuthenticated && !$rootScope.toStateParams.error) {
							$state.go('dashboard');
						}
					});
			};

			return auth_service;
		}]);
