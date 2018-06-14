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
 * @ngdoc function
 * @name matchminerUiApp.controller:PatientSearchCtrl
 * @description
 * # PatientSearchCtrl
 * Controller of the patient search.
 * Allows formatting and querying of API for patient details
 */
angular.module('matchminerUiApp')
	.controller('PatientSearchCtrl',
		['$scope', 'PatientsService', 'ElasticSearchService',
			function ($scope, PatientsService, ElasticSearchService) {
				'use strict';

				var vm = this;

				vm.data = {
					searchText: PatientsService.getSearchTerm()
				};

				/**
				 * Patient search
				 */
				vm.querySearch = function (text) {
					ElasticSearchService.resetSearchTerms();
					PatientsService.setSearchTerm(text);
					return PatientsService.searchPatients();
				};

			}]);
