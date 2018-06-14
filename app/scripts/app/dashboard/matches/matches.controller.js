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
 * @name matchminerUiApp.controller:MatchesCtrl
 * @description
 * # MatchesCtrl
 * Controller of the matches overview page
 */
angular.module('matchminerUiApp')
	.controller('MatchesCtrl', ['$scope', '$rootScope', '$state', '$log', '$q', 'MatchesService', 'UtilitiesService', 'ToastService', 'UserAccount', 'FiltersREST', 'TokenHandler', 'MatchminerApiSanitizer', 'Mailto', 'TEMPLATES', '_', '$window', 'TrialMatchService', '$mdSelect', '$mdMenu',
		function ($scope, $rootScope, $state, $log, $q, MatchesService, UtilitiesService, ToastService, UserAccount, FiltersREST, tokenHandler, MatchminerApiSanitizer, Mailto, TEMPLATES, _, $window, TrialMatchService, $mdSelect, $mdMenu) {
			var dbm = this;

			$log.debug("Loading matchesservice");

			dbm.TEMPLATES = TEMPLATES.matches_view;

			// Available statuses
			dbm.matchStatusesState = {
				0: "New",
				1: "Pending",
				2: "Flagged",
				3: "Not Eligible",
				4: "Enrolled",
				5: "Contacted",
				6: "Eligible",
				7: "Deferred"
			};

			dbm.matchStatusChange = _.map(dbm.matchStatusesState, function(v) {
				var status = {};

				status.state = v;
				status.action = _.map(dbm.matchStatusesState, function(s) {
					if (v != s) {
						return "Mark as " + s.toLowerCase();
					}
				});

				return status;
			});

			dbm.account = UserAccount;
			var _teamId = !!dbm.account ? dbm.account.teams[0] : null;
			MatchesService.setTeamId(_teamId);

			dbm.tableOpts = MatchesService.getTableOpts();
			dbm.tableFilter = MatchesService.getTableFilter();

			dbm.matches = MatchesService.getMatches();
			dbm.matchStatus = MatchesService.getMatchStatus();
			dbm.selectedMatches = [];
			dbm.matchSearchTerms = angular.copy(MatchesService.getMatchSearchTerms());

			$scope.$watch(function() {
				return MatchesService.getMatchStatus();
			}, function(newStatus) {
				dbm.matchStatus = newStatus;
			});

			$scope.$watch(function() {
				return MatchesService.getIsLoading();
			}, function(isLoading) {
				dbm.isLoading = isLoading;
			});

			$scope.$watchCollection(function() {
				return MatchesService.getMatches();
			}, function(matches) {
				dbm.matches = matches;
			});

			dbm.totalElements = 0;
			dbm.matchStatusUpdate = null;

			dbm.filtersQuery = {
				TEAM_ID: _teamId,
				temporary: false,
				status: {
					"$in": [0, 1]
				}
			};

			dbm._loadMatches = function (withMatchStatus, forced) {
				return MatchesService.fetchMatches(withMatchStatus, forced)
					.then(dbm._handleSuccess)
					.catch(dbm._handleError);
			};

			dbm._loadCounts = function () {
				MatchesService.getCounts().then(dbm._handleCountSuccess, dbm._handleError);
			};

			/**
			 * Stop row click event propagation for table row select and
			 * load patient details.
			 */
			dbm.gotoPatientDetails = function(event, patient_id) {
				event.stopPropagation();
				TrialMatchService.setNumberOfTrialMatches(null);
				$state.go('patient', {patient_id: patient_id});
			};

			dbm._handleSuccess = function (result) {
				dbm.totalElements = result._meta.total;
				dbm.matches = result._items;
				dbm.selectedMatches = [];

				MatchesService.setLastResponse(result);
				MatchesService.setMatches(result._items);
				MatchesService.updateMatchMap();

				$log.debug("[SUCCESS] Retrieved matches. ", result);

				dbm._loadCounts();
			};

			// Callback method for when a match model has been successfully updated.
			dbm._successUpdate = function(result) {
				ToastService.success("Successfully updated match status. ");
				$log.debug("[SUCCESS] Successfully updated match status ", result);
				dbm.selectedMatches = [];

				dbm.matchStatusUpdate = null;
				dbm._loadMatches(MatchesService.getMatchStatus(), true);
			};

			dbm._handleCountSuccess = function (result) {
				$log.debug("Successfully got count query results ", result);
				dbm.matchCounts = MatchesService.getReducedCountMapForFilters(result);
				MatchesService.setIsLoading(false);
			};

			dbm._handleError = function (err) {
				$log.error("An error occurred.", err);
				MatchesService.setIsLoading(false);
				ToastService.warn("An error occurred while processing data. ");
			};

			/*
			 * Update selected matches
			 * only when the status has changed.
			 * Header tokens are set in deferred promises
			 */
			dbm.updateStatus = function (selectedMatches, newStat) {
				selectedMatches.forEach(function(match) {
					if (match.TIER === null) {
						match.TIER = 0;
					}
				});
				MatchesService.updateStatus(selectedMatches, newStat)
					.then(dbm._successUpdate)
					.catch(dbm._handleError);
			};

			dbm.onSearchAdd = function (chip) {
				$log.debug("On search add. ", chip);
				MatchesService.addMatchSearchTerm(chip);
				MatchesService.setPage(1);

				MatchesService.fetchMatches(MatchesService.getMatchStatus(), true)
					.then(dbm._handleSuccess)
					.catch(dbm._handleError);

				// Return chip to add it to the list
				return chip;
			};

			dbm.onSearchRemove = function (chip) {
				$log.debug("On search remove");
				MatchesService.removeMatchSearchTerm(chip);
				MatchesService.setPage(1);

				MatchesService.fetchMatches(MatchesService.getMatchStatus(), true)
					.then(dbm._handleSuccess)
					.catch(dbm._handleError);
			};

			/*
			 * Handle sorting of md-data-table
			 */
			dbm.onOrderChange = function (order) {
				MatchesService.setSort(order);
				MatchesService.fetchMatches(MatchesService.getMatchStatus(), true)
					.then(dbm._handleSuccess)
					.catch(dbm._handleError);
			};

			/*
			 * Handle pagination of the md-data-table
			 */
			dbm.onPaginationChange = function (page, limit) {
				MatchesService.setPage(page);
				MatchesService.setPageSize(limit);

				MatchesService.fetchMatches(MatchesService.getMatchStatus(), true)
					.then(dbm._handleSuccess)
					.catch(dbm._handleError);
			};

			dbm._loadFilters = function () {
				$log.debug("Querying registered filters.");
				return FiltersREST.findByQuery({where: angular.toJson(dbm.filtersQuery)}).$promise
					.then(function (filters) {
						$log.debug("Got filters ", filters);
						dbm.filters = filters._items;
					});
			};

			dbm.getSelectedFilterText = function () {
				var filters = dbm.tableFilter.filter;
				if (!filters || !filters.length) {
					return "All filters";
				}
				var a = filters.length;
				if (a == 1) {
					return "<span class='md-red'>1 filter selected</span>";
				} else {
					return "<span class='md-red'>" + a + " filters selected</span>";
				}
			};

			dbm.getSelectedDateText = function () {
				var d = dbm.tableFilter.date;
				if (!d || d == 'all') {
					return "All time";
				}

				return "<span class='md-red'>Within the past " + d + " month" + ( d > 1 ? "s" : '' ) + "</span>";
			};

			dbm.closeFilterSelect = function () {
				var filters = dbm.tableFilter.filter;
				$log.debug("Filter select ", filters);
                $mdSelect.hide();
                $mdMenu.hide();

				if (!filters || !filters.length) {
					MatchesService.setTableFilters([]);
				} else {
					MatchesService.setTableFilters(filters);
				}

				dbm._loadMatches(MatchesService.getMatchStatus(), true);
			};

			dbm.closeDateSelect = function () {
				var filterDate = dbm.tableFilter.date;
				$log.debug("Date select ", filterDate);

				if (filterDate == 'all') {
					MatchesService.setTableDate(null);
				} else {
					MatchesService.setTableDate(filterDate);
				}

				dbm._loadMatches(MatchesService.getMatchStatus(), true);
				return filterDate;
			};

			dbm.emailProvider = function(event, match) {
				event.preventDefault();
				event.stopPropagation();

				var recipient = match.EMAIL_ADDRESS;
				var options = {
					subject: match.EMAIL_SUBJECT,
					body: match.EMAIL_BODY
				};

				var maillink = Mailto.url(recipient, options);

				$window.open(maillink, '_self');
			};

			/**
			 * Is this patient contactable in its current state
			 */
			dbm.isContactable = function(match) {
				// Statusses 0 (new), 1 (pending), 2 (flagged), 7 (deferred) are contactable
				var available = [0, 1, 2, 7];
				return available.indexOf(match.MATCH_STATUS) > -1;
			};

			/*
			 * Perform page initialization
			 */
			dbm._loadMatches(MatchesService.getMatchStatus(), true);
			dbm._loadFilters();

            /**
			 * Display TIER value. If patient has multiple genomic matches, or tier value doesn't exist, show 'N/A'
             * @param match
             * @returns {*}
             */
			dbm.filterMatchTier = function (match) {
				return (Number.isInteger(match.TIER) && !match.MULTIPLE_GENOMIC_ALTERATIONS) ? match.TIER : 'N/A'
			}
		}]);


