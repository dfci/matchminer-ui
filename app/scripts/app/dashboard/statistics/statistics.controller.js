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

/**
 * Created by zachary on 9/19/16.
 */

'use strict';
/**
 * @ngdoc function
 * @name matchminerUiApp.controllerStatisticsCtrl:
 * @description
 * # StatisticsCtrl
 * Statistics Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('StatisticsCtrl', ['StatisticsService', '$log', function(StatisticsService, $log) {
		var sc = this;
		sc.isLoading = true;

		sc.loadStatistics = function () {
			// Get statistics from API
			StatisticsService.get().$promise.then(function(response) {
				if (response._items[0]) {
					sc.createDataTables(
						response['_items'][0]['mm_data_set'],
						response['_items'][0]['active_user_data_set'],
						response['_items'][0]['inactive_user_data_set'],
						response['_items'][0]['active_filter_data_set']
					)
				} else {
					$log.info("No results from query.");
					sc.isLoading = false;
				}
			});
		};

		sc.loadStatistics();
		sc.createDataTables = function(mmDataSet, activeUserDataSet, inactiveUserDataSet, activeFilterDataSet) {
			// MatchMiner Stats
			$('#mmStats').DataTable({
				data: mmDataSet,
				title: "MatchMiner Stats",
				"aoColumns": [
					{title: "Date of last CAMD Update"},
					{title: "Total # of Patients"},
					{title: "Total # of Samples"},
					{title: "Total # of Samples added in last CAMD update"},
					{title: "Total # of Active Users"},
					{title: "Total # of Active Filters"}
				],
				"aaSorting": [[0, 'desc']]
			});

			// Active User Stats
			$('#activeUserStats').DataTable({
				data: activeUserDataSet,
				"aoColumns": [
					{title: "Name"},
					{title: "Roles"},
					{title: "Last login"}
				],
				"aaSorting": [[2, 'desc']]
			});

			// Inactive User Stats
			$('#inactiveUserStats').DataTable({
				data: inactiveUserDataSet,
				"aoColumns": [
					{title: "Name"},
					{title: "Roles"},
					{title: "Last login"}
				],
				"aaSorting": [[2, 'desc']]
			});

			// Active Filter Stats
			$('#activeFilterStats').DataTable({
				data: activeFilterDataSet,
				"aoColumns": [
					{title: "Last updated"},
					{title: "User"},
					{title: "Last login"},
					{title: "Filter Label"},
					{title: "Filter Description"},
					{title: "New"},
					{title: "Pending"},
					{title: "Flagged"},
					{title: "Contacted"},
					{title: "Eligible"},
					{title: "Deferred"},
					{title: "Not eligible"},
					{title: "Enrolled"}
				],
				"aaSorting": [[0, 'desc']]
			});

			sc.isLoading = false;
		}
	}]);