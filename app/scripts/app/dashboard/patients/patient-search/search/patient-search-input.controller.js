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
