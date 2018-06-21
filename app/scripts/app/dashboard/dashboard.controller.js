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
 * @name matchminerUiApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the dashboard
 */
angular.module('matchminerUiApp')
	.controller('DashboardCtrl', ['$state', 'StatusService', 'FiltersREST', 'UtilitiesService', '$q', '$log', 'Principal', 'UserAccount', 'CookieService',
		function ($state, StatusService, FiltersREST, UtilitiesService, $q, $log, Principal, UserAccount, CookieService) {
			var db = this;

			db.account = UserAccount;
			db._teamId = !!db.account ? db.account.teams[0] : null;
			db.isCti = UserAccount.roles.indexOf('cti') > -1;

			db.error = false;
			db.newMatchCount = 0;
			db.registeredFilters = 0;
			db.filtersQuery = {
				TEAM_ID: db._teamId,
				temporary: false,
				status: {
					"$in": [0, 1]
				}
			};
			db.epicAuthorized = true;

			if (CookieService.getIsEpicAuthorized()) {
				db.epicAuthorized = false
			}

			/**
			 * TODO:: Load in resolve
			 */
			db.loadCtiCounts = function() {
				var _queryLastUpdated = function () {
					$log.debug("Querying last updated ");
					return StatusService.query().$promise;
				};

				var _queryNewMatchCount = function () {
					$log.debug("Querying match count ");
					return UtilitiesService.countMatches().$promise;
				};

				var _queryRegisteredFilters = function () {
					$log.debug("Querying registered filters.");
					return FiltersREST.findByQuery({where: angular.toJson(db.filtersQuery)}).$promise;
				};

				if (Principal.isAuthenticated()) {
					db.isLoading = true;

					// Fetch required dashboard parameters from routes.
					$q.all([
						_queryLastUpdated(),
						_queryNewMatchCount(),
						_queryRegisteredFilters()
					]).spread(function (statusObj, matchCount, registeredFilters) {
						if (!!statusObj._items) {
							$log.debug('Got status obj ', statusObj);
							// Sort array and take most recent date.
							var sortedDates = _.sortBy(statusObj._items, function(so){
								return new Date(so.last_update);
							});
							db.lastUpdated = sortedDates[sortedDates.length - 1].last_update;
						}

						if (!!matchCount) {
							$log.debug('Got match count ', matchCount);
							db.newMatchCount = 0;

							// Aggregate count map
							_.each(matchCount, function(v, k) {
								if (v.hasOwnProperty('new')) {
									db.newMatchCount += v.new;
								}
							});
						}

						if (!!registeredFilters._items) {
							$log.debug('Got registered filters', registeredFilters);
							db.registeredFilters = registeredFilters._items.length;
						}
						db.isLoading = false;
					}).catch(db._handleError);
				}
			};

			// Load page with CTI counts
			if (db.isCti) {
				db.loadCtiCounts();
			}

			db._handleError = function (err) {
				db.error = true;
				$log.error("An error occurred ", err);
			};
		}]);
