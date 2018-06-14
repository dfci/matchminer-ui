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
	.factory('responseInterceptor',
		['$rootScope', '$log', '$q', '$injector', '$location', 'ENV',
			function($rootScope, $log, $q, $injector, $location, ENV) {
				var interceptor = {};

				interceptor.response = function(c) {
					// Not authorized param from API after login
					var au = $location.search();
					if (window.location.href.indexOf("?not_auth=1") > -1 && !$rootScope.unauthorized) {
                        $rootScope.$emit("unauthPartUser");
                    } else if (au.not_auth && !$rootScope.unauthorized) {
						$rootScope.$emit("unauthorized");
					}

					return c;
				};

				interceptor.responseError = function (eR) {
					$rootScope.error = null;
					var $state = $injector.get('$state');
					var $mdToast = $injector.get('$mdToast');
					var Principal = $injector.get('Principal');
					var isApiCall = new RegExp(/^\/api/);

					switch (eR.status) {
						case -1:
							$log.error("[Severe] Cannot connect to the API.");

							// Clear credentials and cookies on error
							Principal.clearAuthentication();

							$state.go('home', {
								'error': true,
								'errorMessage': 'Cannot connect to the server.',
								'errorDetails': 'Please contact the developers.'
							});
							break;
                        case 302:
                            // User not found in database.
                            $log.debug('[302] No MatchMiner account.');
                            $state.go('home', {
                                'error': true,
                                'errorMessage': 'No MatchMiner account found for your Partners ID.',
                                'errorDetails': 'Although you have a Partners ID, you are not authorized to access MatchMiner. ' +
                                'However, you can still search for clinical trials below.  To receive full ' +
                                'access, please apply at bit.ly/matchminer-apply.'
                            });
                            break;
						case 308:
							// User not found in database.
							$log.debug('[308] Account requires elevation.');
							$state.go('home', {
								'error': true,
								'errorMessage': 'You are currently not authorized to access MatchMiner.',
								'errorDetails': 'If you have questions, please send an email to '+ ENV.resources.email +'.'
							});

							break;
						case 401:
							$log.warn('[401] Unauthorized. Redirecting to main page.');
							Principal.clearAuthentication();
							$state.go('home');

							break;
						case 404:
							$log.warn('[404]', eR);

							if (isApiCall.test(eR.config.url)) {
								return $q.resolve(eR);
							}

							$state.go('home', {
								'error': true,
								'errorMessage': 'Page not found. The following link could not be resolved by MatchMiner. We\'re sorry!'
							});
							break;
						case 412:
							$log.error('[412] Precondition failed. Missing etag. ', eR);
							$mdToast.show(
								$mdToast.simple()
									.content('Error 412. Unable to update')
									.theme('warn-toast')
									.position('top right')
									.hideDelay(5000)
							);
							break;

						case 422:
							$log.error('[422] Data malformed. Nested documents. ', eR);
							$mdToast.show(
								$mdToast.simple()
									.content('Error 422. Data malformed.')
									.theme('warn-toast')
									.position('top right')
									.hideDelay(5000)
							);
							break;

						case 497:
							$log.warn('[497] Unauthorized. ', eR);

							Principal.clearAuthentication();
							$state.go('home');
							break;
						case 500:
							$log.warn('[500]', eR);

							$state.go('home', {
								'error': true,
								'errorMessage': 'Internal server error.',
								'errorDetails': 'Please contact the developers at <a href="mailto:'+ ENV.resources.email +'">'+ ENV.resources.email +'</a>'
							});
							break;
					}
					return $q.reject(eR);
				};

				return interceptor;
			}]);
