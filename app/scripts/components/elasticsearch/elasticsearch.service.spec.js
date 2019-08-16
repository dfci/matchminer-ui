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

describe('ElasticSearch Service Unit Tests', function () {
	// Setup
	var ElasticSearchMocks,
		ElasticSearchService,
		ClinicalTrialsMocks,
		ClinicalTrialsService;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(inject(function (_ElasticSearchService_, _ElasticSearchMocks_, _ClinicalTrialsService_, _ClinicalTrialsMocks_) {
			ElasticSearchService = _ElasticSearchService_;
			ElasticSearchMocks = _ElasticSearchMocks_;
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;
		})
	);

	describe('Getters and setters', function () {
		it('should set the elastic search index', function () {
			var index = 'matchminer';
			ElasticSearchService.setSearchIndex(index);
			expect(ElasticSearchService.elasticOptions.index).toEqual(index);
		});

		it('should get the elastic search index', function () {
			var index = 'matchminer';
			ElasticSearchService.setSearchIndex(index);
			expect(ElasticSearchService.getSearchIndex()).toEqual(index);
		});

		it('should set the elastic search type', function () {
			var type = 'trial';
			ElasticSearchService.setSearchIndex(type);
			expect(ElasticSearchService.elasticOptions.type).toEqual(type);
		});

		it('should get the elastic search type', function () {
			var type = 'trial';
			ElasticSearchService.setSearchIndex(type);
			expect(ElasticSearchService.getSearchType()).toEqual(type);
		});

		it('should set the elastic search from', function () {
			var from = 20;
			ElasticSearchService.setSearchFrom(from);
			expect(ElasticSearchService.elasticBody.from).toEqual(from);
		});

		it('should get the elastic search from', function () {
			var from = 20;
			ElasticSearchService.setSearchFrom(from);
			expect(ElasticSearchService.getSearchFrom()).toEqual(from);
		});

		it('should set the elastic search size', function () {
			var size = 15;
			ElasticSearchService.setSearchSize(size);
			expect(ElasticSearchService.elasticBody.size).toEqual(size);
		});

		it('should get the elastic search size', function () {
			var size = 15;
			ElasticSearchService.setSearchSize(size);
			expect(ElasticSearchService.getSearchSize()).toEqual(size);
		});

		it('should indicate if the elastic search service has aggregators', function () {
			var aggregators = ClinicalTrialsService.getAggregators();
			ElasticSearchService.setSearchAggregators(aggregators);
			expect(ElasticSearchService.hasSearchAggregators()).toEqual(true);
		});

		it('should set the elastic search aggregators', function () {
			var aggregators = ClinicalTrialsService.getAggregators();
			ElasticSearchService.setSearchAggregators(aggregators);
			expect(ElasticSearchService.elasticBody.aggs).toEqual(aggregators);
		});

		it('should get the elastic search aggregators', function () {
			var aggregators = ClinicalTrialsService.getAggregators();
			ElasticSearchService.setSearchAggregators(aggregators);
			expect(ElasticSearchService.getSearchAggregators()).toEqual(aggregators);
		});

		it('should indicate if the elastic search service has filters', function () {
			//var aggregators = ClinicalTrialsService.getAggregators();
			//ElasticSearchService.setSearchAggregators(aggregators);
			//expect(ElasticSearchService.hasSearchAggregators()).toEqual(true);
		});

		it('should set the elastic search filters', function () {
			// Test with a single filter
			var filters = [];
			filters.push(ClinicalTrialsMocks.getFilter());
			ElasticSearchService.setSearchFilters(filters);
			var esFilters = ElasticSearchService.elasticBody.filter;
			expect(esFilters).toEqual(filters);
		});

		it('should get the elastic search filters', function () {
			// Test with a single filter
			var filters = [];
			filters.push(ClinicalTrialsMocks.getFilter());
			ElasticSearchService.setSearchFilters(filters);
			var esFilters = ElasticSearchService.getSearchFilters();
			expect(esFilters).toEqual(filters);
		});

		it('should indicate if the elastic search service has a search term', function () {
			var term = 'EGFR Trial';
			ElasticSearchService.setSearchTerm(term);
			expect(ElasticSearchService.hasSearchTerm()).toEqual(true);
		});

		it('should set the elastic search term', function () {
			var term = 'EGFR Trial';
			ElasticSearchService.setSearchTerm(term);
			expect(ElasticSearchService.searchTerm).toEqual(term);
		});

		it('should get the elastic search term', function () {
			var term = 'EGFR Trial';
			ElasticSearchService.setSearchTerm(term);
			expect(ElasticSearchService.getSearchTerm()).toEqual(term);
		});

		it('should indicate if the elastic search service has sorting queued', function () {
			var sorter = '-status';
			ElasticSearchService.setSearchSort(sorter);
			expect(ElasticSearchService.hasSearchSort()).toEqual(true);
		});

		it('should set the elastic search sort', function () {
			var sorter = "-status";
			ElasticSearchService.setSearchSort(sorter);
			expect(ElasticSearchService.elasticBody.sort[0]).toEqual(ElasticSearchMocks.getSorter());
		});

		it('should get the elastic search sort', function () {
			var sorter = '-status';
			ElasticSearchService.setSearchSort(sorter);

			/**
			 * Only test the first sorter in the array.
			 * For now only single sorters are supported
			 */
			var searchSort = ElasticSearchService.getSearchSort()[0];
			expect(searchSort).toEqual(ElasticSearchMocks.getSorter());
		});

		it('should get the elastic search query', function () {
			var searchTerm = 'BRCA Trial';
			ElasticSearchService.setSearchTerm(searchTerm);
			expect(ElasticSearchService.getSearchQuery()).toEqual(ElasticSearchMocks.getSearchQuery());
		});

		it('should get the elastic search query for temozolomide signature', function () {
			//elastic search query should omit searching for drugs
			var searchTerm = 'Temozolomide Signature';
			ElasticSearchService.setSearchTerm(searchTerm);
			expect(ElasticSearchService.getSearchQuery()).toEqual(ElasticSearchMocks.getTemozolomideSearch());
		});
	});

});
