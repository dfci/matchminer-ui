'use strict';

angular.module('matchminerUiApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('clinicaltrials', {
				abstract: true,
				parent: 'site',
				url: '/clinicaltrials',
				ncyBreadcrumb: {
					skip: true
				}
			})
			.state('clinicaltrials.overview', {
				parent: 'clinicaltrials',
				url: '?gene_mutant&gene_wildtype&tumor_type&hormone_receptor&age&phase&drug&trial_status&query',
				data: {
					authorities: []
				},
				params: {
					embeddedSearch: true,
					searchTerm: null,
					geneSearchTerm: null,
					diseaseCenterSearchTerm: null,
					tumorTypeSearchTerm: null
				},
				resolve: {
					trialSearch: ['ClinicalTrialsService', 'ElasticSearchService', '$stateParams',
						function (ClinicalTrialsService, ElasticSearchService, $stateParams) {
							// Handle URL search parameters to add as search filters
							ClinicalTrialsService.handleSearchParamFilter($stateParams);

							// Empty source filter
							ElasticSearchService.setSourceFilter(null);
							
							var searchTerms = {
								All: $stateParams.searchTerm || ElasticSearchService.getSearchTerm(),
								Gene: $stateParams.geneSearchTerm || ElasticSearchService.getGeneSearchTerm(),
								DiseaseCenter: $stateParams.diseaseCenterSearchTerm || ElasticSearchService.getDiseaseCenterSearchTerm(),
								TumorType: $stateParams.tumorTypeSearchTerm || ElasticSearchService.getTumorTypeSearchTerm()
							};
							
							return ClinicalTrialsService.fullTextSearch(searchTerms);
					}],
					trialMatches: ['$q', function($q) {
						return $q.resolve();
					}]
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/clinical-trials/clinical-trials.html',
						controller: 'ClinicalTrialsCtrl',
						controllerAs: 'ct'
					},
					'navbar@clinicaltrials.overview': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					},
					'clinical-trials-search@clinicaltrials.overview': {
						templateUrl: 'scripts/app/clinical-trials/search/clinical-trials-search.html',
						controller: 'ClinicalTrialsSearchCtrl',
						controllerAs: 'cts'
					},
					'clinical-trials-filters@clinicaltrials.overview': {
						templateUrl: 'scripts/app/clinical-trials/filters/clinical-trials-filters.html',
						controller: 'ClinicalTrialsFiltersCtrl',
						controllerAs: 'ctf'
					},
					'clinical-trials-results@clinicaltrials.overview': {
						templateUrl: 'scripts/app/clinical-trials/results/clinical-trials-results.html',
						controller: 'ClinicalTrialsResultsCtrl',
						controllerAs: 'ctr'
					}
				},
				ncyBreadcrumb: {
					label: 'Clinical Trials'
				}
			})
			.state('clinicaltrials.detail', {
				parent: 'clinicaltrials',
				url: '/:protocol_no',
				data: {
					authorities: []
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/clinical-trials/details/clinical-trial-details.html',
						controller: 'ClinicalTrialsDetailsCtrl',
						controllerAs: 'ctd'
					},
					'navbar@clinicaltrials.detail': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				},
				ncyBreadcrumb: {
					label: '{{ctd.trial.protocol_no}}',
					parent: 'clinicaltrials.overview'
				}
			});
	});
