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
 * @name matchminerUiApp.controller:FiltersCtrl
 * @description
 * # FiltersCtrl
 * Controller of the filters overview dashboard page
 */
angular.module('matchminerUiApp')
	.controller('FiltersCtrl', ['$scope', '$state', '$log', 'ToastService', 'FiltersService', 'MatchesService',
		'UserAccount', '$mdDialog', '$timeout', 'ClinicalTrialsService', 'ENV', '$mdToast', '$location',
		function ($scope, $state, $log, ToastService, FiltersService, MatchesService,
		          UserAccount, $mdDialog, $timeout, ClinicalTrialsService, ENV, $mdToast, $location) {
			var dbf = this;

			var _teamId = UserAccount.teams[0];
			FiltersService.setTeamId(_teamId);

			dbf.filters = FiltersService.getFilters();
			dbf.tableOpts = FiltersService.getTableOpts();
			dbf.totalElements = 0;
			dbf.selectedItem = '';

			$scope.$watch(function() {
				return FiltersService.getIsLoading();
			}, function(isLoading) {
				dbf.isLoading = isLoading;
			});

			$scope.$watchCollection(function() {
				return FiltersService.getFilters();
			}, function(filters) {
				dbf.filters = filters;
			});

			/**
			 * Load all the previously stored genomic filters from the resource.
			 * returns: promise
			 */
			dbf.loadAvailableFilters = function () {
				return FiltersService.fetchFilters()
					.then(dbf._successFilterQuery)
					.catch(dbf._handleError);
			};
			/**
			 * Show the confirmation dialog
             */
			dbf.showWatchDialog = function () {
                $mdDialog.show({
                    templateUrl: '/scripts/app/dashboard/filters/partials/watch.html',
                    locals: {
                        parent: dbf
                    },
                    controller: angular.noop,
                    controllerAs: 'dbf',
                    bindToController: true,
                    clickOutsideToClose: true
				});
            };
			 /**
			 * Populate autocomplete suggestions based on user input. Returns a promise
             * @param suggestion
             * @returns {*}
             */
            dbf.suggestWatch = function(suggestion) {
                return ClinicalTrialsService.suggestTermsForString(['protocol_no_suggest'], suggestion);
            };

			   /**
			 * Send add watch query to backend
             * @param trial
             */
            dbf.sendWatch = function(trial) {
                $.ajax({
                    type: "POST",
                    url: ENV.api.endpoint + "/trial_watch/" + trial.text,
                    dataType: "html",
                    data: {
                        user_id: UserAccount._id,
                        team_id: UserAccount.teams[0]
                    },
                    success: function (response) {
                        ToastService.success("Successfully added to trial " + trial.text + " watch list.");
                    },
                    error: function () {
                        ToastService.warn("Error adding trial " + trial.text + " to watch list. Please try again.");
                    }
                });
                $mdDialog.hide();
            };

			/**
			 * Show a deletion confirmation dialog prior to deleting a filter.
			 *
			 * @param ev event
			 * @param filter The filter to be deleted
			 */
			dbf.showConfirmDeleteFilter = function (ev, filter) {
				var confirm = $mdDialog.confirm()
					.title('Delete genomic filter?')
					.content('Are you sure you would like to delete your genomic filter?')
					.ariaLabel('Delete filter')
					.targetEvent(ev)
					.ok('Yes, delete')
					.cancel('No');

				// Show the confirmation dialog
				$mdDialog.show(confirm).then(function () {
					// Set genomic filter status to '3' -> Deleted.
					filter.status = 3;

					// Handles deleting matches and filters
					FiltersService.updateGenomicFilter(filter)
						.then(function () {
							// Show success msg
							ToastService.success("Successfully deleted");
							MatchesService.setTableFilters(null);
							dbf.loadAvailableFilters();
							dbf.reload();
						})
						.catch(dbf._handleError);
				});
			};

			dbf.reload = function () {
                window.location.reload();
			};

			/**
			 * Load a specific filter in the filter editor
			 *
			 * @param filter The filter object to be loaded
			 */
			dbf.loadEditGenomicFilter = function (filter) {
				if (!!filter && filter._id) {
					$state.go('filter-edit', {id: filter._id});
				} else {
					ToastService.warn("Unable to load filter. ");
				}
			};

			/**
			 * Create a new filter in the filter editor
			 */
			dbf.createNewFilter = function () {
				$state.go('filter-new');
			};

			/**
			 * Resource query handlers
			 */
			dbf._successFilterQuery = function (res) {
				dbf.totalElements = res._meta.total;

				FiltersService.setFilters(res._items);
				FiltersService.setIsLoading(false);

				$log.debug("[SUCCESS] Filter query results ", res);
			};

			dbf._handleError = function (err) {
				FiltersService.setIsLoading(false);

				$log.error("[ERROR] Fetching genomic filters. ", err);
				ToastService.warn("Error while fetching genomic filters.");
			};

			/**
			 * Table methods
			 */

			// Handle sorting of md-table
			dbf.onOrderChange = function(order) {
				FiltersService.setSort(order);
				FiltersService.fetchFilters()
					.then(dbf._successFilterQuery)
					.catch(dbf._handleError);
			};

			/**
			 * Handle pagination of the md-data-table
			 * @param page The page to navigate to
			 * @param limit The size of the page to load.
			 */
			dbf.onPaginationChange = function (page, limit) {
				FiltersService.setPage(page);
				FiltersService.setPageSize(limit);

				FiltersService.fetchFilters()
					.then(dbf._successFilterQuery)
					.catch(dbf._handleError);
			};

			dbf.loadAvailableFilters();
		}]);
