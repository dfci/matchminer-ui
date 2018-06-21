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
	.factory('requestInterceptor',
		['$log', 'CookieService', 'ENV', '$location',
			function($log, CookieService, ENV, $location) {
				var interceptor = {};

				interceptor.request = function (config) {
					var url = config.url;

					/**
					 * When were doing an ElasticSearch query,
					 * Remove authorization header as it might not be accepted by the ES backend.
					 */
					if (url.startsWith(ENV.elasticsearch.proxy)) {
						$log.debug('[Request] ', config);
						delete config.headers['Authorization'];
						return config;
					}

					// Environment requires authorization
					if (ENV.samlAuthentication || ENV.devUser) {
						// Check for dev env user
						if (!!ENV.devUser) {
							CookieService.setRequestToken(ENV.devUser.token);
							CookieService.setUserId(ENV.devUser.user_id);
						}

						// Is cookie token set
						if (CookieService.hasRequestToken()) {
							config.headers['Authorization'] = 'Basic ' + btoa(CookieService.getRequestToken() + ':');
						}

                        // If EPIC parameter in cookie, use restricted view
                        if (CookieService.getIsEpic()) {
                            ENV.EPIC = true;
                        }

                        // If url contains cBioPortal parameter, use restricted view
                        if ($location.$$search.cBio) {
                            ENV.cBio = true;
                        }
					}

					return config;
				};

				interceptor.requestError = function (config) {
					$log.error('[Request Error] ', config);
					return config;
				};

				return interceptor;
			}]);
