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

describe('Controller: ClinicalTrialsFiltersCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		mockTrial,
		ElasticSearchService,
		ElasticSearchMocks,
		ClinicalTrialsService,
		ClinicalTrialsMocks;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		inject(function ($controller, $rootScope, _ElasticSearchService_, _ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchMocks_, _$state_) {
			scope = $rootScope.$new();
			state = _$state_;
			rootScope = $rootScope;
			ElasticSearchService = _ElasticSearchService_;
			ElasticSearchMocks = _ElasticSearchMocks_;
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;

			var searchResults = ElasticSearchMocks.mockElasticResults();
			searchResults.hits.hits = [];

			mockTrial = ClinicalTrialsMocks.mockClinicalTrials()[0];

			ctrl = $controller('ClinicalTrialsFiltersCtrl', {
				$scope: scope
			});

		});
	});

	it('should initialize with no trial filters categories loaded', function() {
		expect(ctrl.filters).toEqual([]);
	});

	it('should be able to detect changes of the  loading indicator used in the clinicaltrialsservice', function () {
		expect(ctrl.isLoading).toBeFalsy();
		ClinicalTrialsService.isLoading = true;

		scope.$digest();
		expect(ctrl.isLoading).toBeTruthy();
	});

	it('should be able to check if a aggregator is active by its value', function() {
		spyOn(ClinicalTrialsService, 'isActiveFilter');
		var agg = 'HUGO_GENE_SYMBOL';
		var value = 'BRAF';

		ctrl.isActive(agg, value);
		expect(ClinicalTrialsService.isActiveFilter).toHaveBeenCalledWith(agg, value);
	});

	it('should return false when trying to toggle a filter and the controller is loading.', function() {
		spyOn(ClinicalTrialsService, 'searchFilter');
		var agg = 'HUGO_GENE_SYMBOL';
		var value = 'BRAF';
		ctrl.isLoading = true;

		var ret = ctrl.toggleFilter(agg, value);
		expect(ret).toBeFalsy();
	});

	it('should be able to toggle a filter by aggregator and value', function() {
		spyOn(ClinicalTrialsService, 'searchFilter');
		var filterName = 'Gene (Mutant)';
		var agg = 'HUGO_GENE_SYMBOL';
		var value = 'braf';
		var optionName = 'BRAF';

		ctrl.toggleFilter(filterName, agg, value, optionName);
		expect(ClinicalTrialsService.searchFilter).toHaveBeenCalledWith(filterName, agg, value, optionName, true);
	});

	it('should be able to toggle all facets for a single filter', function() {
		spyOn(ClinicalTrialsService, 'setFacetOptionsState');
		var filter = ClinicalTrialsMocks.mockFilters()[0];

		ctrl.showAllFacetsForFilter(filter);
		expect(ClinicalTrialsService.setFacetOptionsState).toHaveBeenCalledWith(ctrl.facetOptions);
	});

});
