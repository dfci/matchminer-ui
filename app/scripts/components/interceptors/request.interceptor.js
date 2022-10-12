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
					// Check for dev env user
					if (!!ENV.devUser) {
						CookieService.setRequestToken(ENV.devUser.token);
						CookieService.setUserId(ENV.devUser.user_id);
					}

					// Is cookie token set
					if (CookieService.hasRequestToken()) {
						config.headers['Authorization'] = 'Basic ' + btoa(CookieService.getRequestToken() + ':');
					}

					// If url contains EPIC parameter, use restricted view
					if ($location.$$search.epic) {
						ENV.EPIC = true;
					}

					// If url contains cBioPortal parameter, use restricted view
					if ($location.$$search.cBio) {
						ENV.cBio = true;
					}

					return config;
				};

                //When a user is redirected back to MM after being prompted to login, bring them to the original page they were trying to access
                if (localStorage.getItem('afterAuthRedirectURL') !== null) {
                    var redirectURL = localStorage.getItem('afterAuthRedirectURL');
                    $log.info("Setting redirect local storage_");
                    setTimeout(function () {
                        localStorage.removeItem('afterAuthRedirectURL');
                        window.location.href = redirectURL;
                    }, 1000);
                }

				interceptor.requestError = function (config) {
					$log.error('[Request Error] ', config);
					return config;
				};

				return interceptor;
			}]);
