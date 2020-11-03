/**
 * @ngdoc function
 * @name matchminerUiApp.controller:PatientSearchResultsCtrl
 * @description
 * # PatientSearchResultsCtrl
 * Controller for the patient search results overview
 */
angular.module('matchminerUiApp')
	.controller('PatientSearchResultsCtrl',
		['$scope', '$location', '$mdDialog', 'PatientsService', '$log', '$state', 'TrialMatchService', '$document', '$timeout',
			function ($scope, $location, $mdDialog, PatientsService, $log, $state, TrialMatchService, $document, $timeout) {
				'use strict';

				var vm = this;
				vm.patientsDisplay = [];
				vm.numPatients = 0;
				vm.metadata = PatientsService.getMetadata();
				vm.searchTerm = PatientsService.getLastSearchTerm();

				vm.sampleIcons = {
					1: 'looks_one',
					2: 'looks_two',
					3: 'looks_3',
					4: 'looks_4',
					5: 'looks_5',
					6: 'looks_6'
				};

				$scope.$watchCollection(
					function () {
						return PatientsService.getMetadata();
					},
					function (metadata) {
						if (metadata !== undefined) {
							vm.metadata = metadata;
						}
					}
				);

				$scope.$watch(
					function () {
						return PatientsService.isLoading;
					},
					function (isLoading) {
						vm.isLoading = isLoading;
					}
				);

				$scope.$watch(
					function () {
						return PatientsService.getLastSearchTerm();
					},
					function (searchTerm) {
						vm.searchTerm = searchTerm;
					}
				);

				$scope.$watchCollection(
					function () {
						return PatientsService.getResults();
					},
					function (results) {
						if (results  && Object.keys(results).length) {
							vm.patientsDisplay = _.map(results, function(v, k){
								return v;
							});
							vm.numPatients = Object.keys(results).length;
							$timeout(function(){
								vm.scrollToResults();
							}, 250);
						} else {
							vm.patientsDisplay = null;
							vm.numPatients = null;
						}
					}
				);

				vm.scrollToResults = function() {
					var section = 'patient-search-results';
					$log.debug("Scrolling to section ", section);
					var scrollSection = angular.element(document.getElementById(section));
					return $document.scrollToElementAnimated(scrollSection, 150, 500);
				};

				vm.goToRecord = function (pid) {
					$mdDialog.hide();
					$state.go('patient', {patient_id: pid});
				};

				vm.navigateToDetails = function (event, patient) {
					TrialMatchService.setNumberOfTrialMatches(null);

					// Check if patient has more registered samples.
					PatientsService.queryPatient(patient._id)
						.then( function (res) {
							// 1. If patient has related samples sample, show modal
							if (!!res.RELATED && res.RELATED.length > 0) {
								vm.sampleOptions = [];
								vm.sampleOptions = angular.copy(res.RELATED);
								vm.sampleOptions.push(res);

								$mdDialog.show({
									templateUrl: 'scripts/app/dashboard/patients/patient-search/sample-select/patient-sample-select.html',
									locals: {
										parent: vm,
										patient: res
									},
									controller: angular.noop,
									controllerAs: 'ctrl',
									bindToController: true,
									clickOutsideToClose: true
								});
							} else {
								// 2. If patient has a single sample, redirect to patient page.
								if (!!patient && !!patient._id && patient._id !== 'undefined') {
									$state.go('patient', {patient_id: patient._id});
								}
							}
						}, function (err) {
							console.error("Error while querying patient record: ", err);
						});

				};


			}]);
