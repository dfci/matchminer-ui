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
	.config(function ($stateProvider) {
		$stateProvider
			.state('patient', {
				parent: 'dashboard',
				url: '/patients/:patient_id',
                params: {keep_search_filters: null},
				data: {
					pageTitle: 'MatchMiner - Patient details',
					authorities: ['cti', 'oncologist', 'admin']
				},
				resolve: {
					patient: ['PatientsREST', '$stateParams', function(PatientsREST, $stateParams) {
						return PatientsREST.queryClinical({ id: $stateParams.patient_id}).$promise;
					}],
					trialMatches: ['TrialMatchService', 'patient', function(TrialMatchService, patient) {
						// Only fetch vital_status alive and trials with open steps, arms and dose lvls
						var vital_status = 'alive';
						var trial_status = 'open';
						var sort = 'sort_order';
						
						return TrialMatchService.getTrialMatchesForPatient(patient.MRN, vital_status, trial_status, patient.SAMPLE_ID, sort);
					}],
					trialSearch: ['ClinicalTrialsService', 'ElasticSearchService', 'TrialMatchService', 'trialMatches', '$q', 'patient', '$stateParams',
						function(ClinicalTrialsService, ElasticSearchService, TrialMatchService, trialMatches, $q, patient, $stateParams) {
							// Reset filters and Elasticsearch pagination
       
							if ($stateParams.keep_search_filters) {
                                ClinicalTrialsService.reset(false);
							} else {
                                ClinicalTrialsService.reset(true);
							}
							
							ElasticSearchService.reset();

							if (!trialMatches || !trialMatches._items.length) {
								return $q.resolve();
							}

							var excludeTrialsWithStatus = [
								"New",
								"On Hold",
								"SRC Approval",
								"IRB Initial Approval",
								"Activation Coordinator Signoff",
								"Closed to Accrual",
								"Suspended",
								"IRB Study Closure",
								"Terminated"
							];
							var trial_protocol_nos = _.pluck(trialMatches._items, 'protocol_no');
							
							var sourceFilter = {};
							
							sourceFilter.must = {
								key: 'protocol_no',
								values: trial_protocol_nos
							};

							sourceFilter.must_not = {
								key: '_summary.status.value',
								values: excludeTrialsWithStatus
							};

							if (!ElasticSearchService.hasSearchFilters() || !TrialMatchService.isCurrentSampleId(patient.SAMPLE_ID)) {
								TrialMatchService.numberOfTrialMatches = null;
							}
							
							TrialMatchService.setSampleId(patient.SAMPLE_ID);

							// Retrieve only matches from specific sources
							ElasticSearchService.setSourceFilter(sourceFilter);
							
							// ElasticSearchService.searchSizeLimit
							ElasticSearchService.setPatientSearchSize(1000);
							
							// Reset filters for trial matching results.
							ClinicalTrialsService.setIsTrialMatching(true);
							
							return ClinicalTrialsService.fullTextSearch();
					}]
				},
				views: {
					'content@dashboard': {
						templateUrl: 'scripts/app/dashboard/patients/patient-details/patient-details.html',
						controller: 'PatientDetailsCtrl',
						controllerAs: 'pdc'
					},
					'clinical-trials-filters@patient': {
						templateUrl: 'scripts/app/clinical-trials/filters/clinical-trials-filters.html',
						controller: 'ClinicalTrialsFiltersCtrl',
						controllerAs: 'ctf'
					},
					'clinical-trials-results@patient': {
						templateUrl: 'scripts/app/clinical-trials/results/clinical-trials-results.html',
						controller: 'ClinicalTrialsResultsCtrl',
						controllerAs: 'ctr'
					}
				},
				ncyBreadcrumb: {
					label: 'Patient record'
				}
			})
			.state('patient-trial-match', {
				parent: 'dashboard',
				url: '/patients/:patient_id/trial/:protocol_no',
				data: {
					pageTitle: 'MatchMiner - Trial match details',
					authorities: ['cti', 'oncologist', 'admin']
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/clinical-trials/details/clinical-trial-details.html',
						controller: 'ClinicalTrialsDetailsCtrl',
						controllerAs: 'ctd'
					},
					'navbar@patient-trial-match': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				},
				ncyBreadcrumb: {
					label: 'Trial match [{{ctd.trial.protocol_no}}]',
					parent: 'patient'
				}
			})
			.state('patient-search', {
				parent: 'dashboard',
				url: '/patient-search',
				data: {
					pageTitle: 'MatchMiner - Search for patients',
					authorities: ['cti', 'oncologist', 'admin' ]
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/dashboard/patients/patient-search/patient-search.html'
					},
					'navbar@patient-search': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					},
					'patient-search-input@patient-search': {
						templateUrl: 'scripts/app/dashboard/patients/patient-search/search/patient-search-input.html',
						controller: 'PatientSearchCtrl',
						controllerAs: 'psc'
					},
					'patient-search-results@patient-search': {
						templateUrl: 'scripts/app/dashboard/patients/patient-search/results/patient-search-results.html',
						controller: 'PatientSearchResultsCtrl',
						controllerAs: 'psrc'
					}
				}
			});
	});
