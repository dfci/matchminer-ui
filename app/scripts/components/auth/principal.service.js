'use strict';

angular.module('matchminerUiApp')
	.factory('Principal', ['$rootScope', '$state', '$q', '$log', 'CookieService', 'localStorageService', 'AuthServerProvider', 'ENV', 'Account', '$analytics',
		function ($rootScope, $state, $q, $log, CookieService, localStorageService, AuthServerProvider, ENV, Account, $analytics) {
			var _identity,
				_authenticated = false;

			var service = {};

			service.isIdentityResolved = function () {
				return angular.isDefined(_identity);
			};

			service.getIdentity = function() {
				return _identity;
			};

			service.isAuthenticated = function () {
				//for dev debugging of homepage. cancels automatic redirect
				//return false;
				return _authenticated;
			};

			service.authenticate = function (identity) {
				_identity = identity;
				_authenticated = identity !== null;
			};

			service.hasAuthority = function (authority) {
				if (!_authenticated) {
					return false;
				}

				return service.identity(false).then(function (_id) {
					return _id.roles && _id.roles.indexOf(authority) !== -1;
				}, function (err) {
					return false;
				});
			};

			service.hasAnyAuthority = function (authorities) {
				if (!_authenticated || !_identity || !_identity.roles) {
					return false;
				}

				for (var i = 0; i < authorities.length; i++) {
					if (_identity.roles.indexOf(authorities[i]) !== -1) {
						return true;
					}
				}

				return false;
			};

			service.clearAuthentication = function() {
				_identity = null;
				_authenticated = false;
				CookieService.removeUserId();
				CookieService.removeRequestToken();
			};

			service.identity = function (force) {
				var deferred = $q.defer();

				if (force === true) {
					_identity = undefined;
				}

				// Check and see if we have retrieved the identity data from the server.
				// if we have, reuse it by immediately resolving
				if (angular.isDefined(_identity)) {
					deferred.resolve(_identity);
					return deferred.promise;
				}

				/*
				 * Environment requires SAML authentication
				 */

				if (ENV.samlAuthentication || ENV.devUser) {
					$log.debug('SAML Auth required');

					// Does user have token?
					if (CookieService.hasRequestToken()) {
						$log.debug('CS has token. Setting localstorage.');

						// Retrieve the identity data from the server, set the identity.
						Account.get({'id': CookieService.getUserId()}).$promise
							.then(function (acc) {
								if (!_identity) {
									var username = acc.first_name + " " + acc.last_name;
									$analytics.setUsername(username);
								}

								_identity = acc;
								_authenticated = true;

								deferred.resolve(_identity);
							})
							.catch(function () {
								_identity = null;
								_authenticated = false;
								deferred.resolve(_identity);
							});
					} else {
						$log.debug('SAML Required. No token found.');
						// Clear possible existing user details
						service.clearAuthentication();
						_identity = null;
						_authenticated = false;
						deferred.resolve(_identity);
					}
				} else {
					$log.warn('No SAML Auth set. Rejecting auth.');

					_authenticated = false;
					_identity = null;
					deferred.reject(_identity);
				}

				return deferred.promise;
			};

			return service;
		}]);
