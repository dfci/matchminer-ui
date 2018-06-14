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

describe('Matches Service Unit Tests', function () {
	// Setup
	var MatchesService,
		MatchesMocks,
		MatchesREST,
		MatchesRESTPromise,
		UtilitiesService,
		UtilitiesServicePromise,
		rootScope,
		scope,
		$q;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(inject(function (_$rootScope_, _MatchesService_, _MatchesMocks_, _MatchesREST_, _$q_, _UtilitiesService_) {
			rootScope = _$rootScope_;
			scope = rootScope.$new();
			MatchesService = _MatchesService_;
			MatchesMocks = _MatchesMocks_;
			MatchesREST = _MatchesREST_;
			$q = _$q_;
			UtilitiesService = _UtilitiesService_;
			UtilitiesServicePromise = $q.defer();
			MatchesRESTPromise = $q.defer();
		})
	);

	describe('Getters and setters', function () {
		it('should set the filter status', function () {
			var filterStatus = 1;
			MatchesService.setFilterStatus(filterStatus);
			expect(MatchesService.matchOpts.FILTER_STATUS).toEqual(filterStatus);
		});

		it('should get the filter status', function () {
			var filterStatus = 1;
			MatchesService.setFilterStatus(filterStatus);
			expect(MatchesService.getFilterStatus()).toEqual(filterStatus);
		});

		it('should set the match status', function () {
			var matchStatus = 0;
			MatchesService.setMatchStatus(matchStatus);
			expect(MatchesService.matchOpts.MATCH_STATUS).toEqual(matchStatus);
		});

		it('should get the match status', function () {
			var matchStatus = 1;
			MatchesService.setMatchStatus(matchStatus);
			expect(MatchesService.getMatchStatus()).toEqual(matchStatus);
		});

		it('should set the filter ID query', function () {
			var filterQuery = {
				'$in': ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3']
			};
			MatchesService.setFilters(filterQuery);
			expect(MatchesService.matchOpts.FILTER_ID).toEqual(filterQuery);
		});

		it('should get the filter ID query', function () {
			var filterQuery = {
				'$in': ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3']
			};
			MatchesService.setFilters(filterQuery);
			expect(MatchesService.getFilters()).toEqual(filterQuery);
		});

		it('should set the team ID', function () {
			var teamId = "1234567890";
			MatchesService.setTeamId(teamId);
			expect(MatchesService.matchOpts.TEAM_ID).toEqual(teamId);
		});

		it('should get the team ID', function () {
			var teamId = "1234567890";
			MatchesService.setTeamId(teamId);
			expect(MatchesService.getTeamId()).toEqual(teamId);
		});

		it('should set the matches', function () {
			var matches = MatchesMocks.mockMatchesResponse()._items;
			MatchesService.setMatches(matches);
			expect(MatchesService.matches).toEqual(matches);
		});

		it('should get the matches', function () {
			var matches = MatchesMocks.mockMatchesResponse()._items;
			MatchesService.setMatches(matches);
			expect(MatchesService.getMatches()).toEqual(matches);
		});

		it('should get the table options', function () {
			var _TABLEOPTS = {
				max_results: 10,
				sort: '',
				page: 1
			};
			expect(MatchesService.getTableOpts()).toEqual(_TABLEOPTS);
		});

		it('should get the table filters', function () {
			var _TABLEFILTER = {
				date: null,
				filter: null
			};
			expect(MatchesService.getTableFilter()).toEqual(_TABLEFILTER);
		});

		it('should set the sort order', function () {
			var order = "-FILTER_ID";
			MatchesService.setSort(order);
			expect(MatchesService.tableOpts.sort).toEqual(order);
		});

		it('should get the sort order', function () {
			var order = "-FILTER_ID";
			MatchesService.setSort(order);
			expect(MatchesService.getSort()).toEqual(order);
		});

		it('should set the page', function () {
			var page = 1;
			MatchesService.setPage(page);
			expect(MatchesService.tableOpts.page).toEqual(page);
		});

		it('should get the page', function () {
			var page = 1;
			MatchesService.setMatchStatus(page);
			expect(MatchesService.getPage()).toEqual(page);
		});

		it('should set the page size', function () {
			var pageSize = 25;
			MatchesService.setPageSize(pageSize);
			expect(MatchesService.tableOpts.max_results).toEqual(pageSize);
		});

		it('should get the page size', function () {
			var pageSize = 25;
			MatchesService.setPageSize(pageSize);
			expect(MatchesService.getPageSize()).toEqual(pageSize);
		});

		it('should set the loading state', function () {
			var isLoading = true;
			MatchesService.setIsLoading(isLoading);
			expect(MatchesService.isLoading).toEqual(isLoading);
		});

		it('should get the loading state', function () {
			var isLoading = true;
			MatchesService.setIsLoading(isLoading);
			expect(MatchesService.getIsLoading()).toEqual(isLoading);
		});

		it('should add and get the match search terms', function () {
			var matchSearchTerms = ['glioblastoma', 'EGFR'];
			MatchesService.addMatchSearchTerm('glioblastoma');
			MatchesService.addMatchSearchTerm('EGFR');
			expect(MatchesService.getMatchSearchTerms()).toEqual(matchSearchTerms);
		});

		it('should remove a match search term', function () {
			var matchSearchTerms = ['glioblastoma'];
			MatchesService.addMatchSearchTerm('glioblastoma');
			MatchesService.addMatchSearchTerm('EGFR');
			MatchesService.removeMatchSearchTerm('EGFR');
			expect(MatchesService.getMatchSearchTerms()).toEqual(matchSearchTerms);
		});

		it('should set the table filters', function () {
			var tableFilters = ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3'];
			MatchesService.setTableFilters(tableFilters);
			expect(MatchesService.tableFilter.filter).toEqual(tableFilters);
		});

		it('should get the table filters', function () {
			var tableFilters = ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3'];
			MatchesService.setTableFilters(tableFilters);
			expect(MatchesService.getTableFilters()).toEqual(tableFilters);
		});

		it('should set the table date', function () {
			var tableDate = 6;
			MatchesService.setTableDate(tableDate);
			expect(MatchesService.tableFilter.date).toEqual(tableDate);
		});

		it('should get the table date', function () {
			var tableDate = 6;
			MatchesService.setTableDate(tableDate);
			expect(MatchesService.getTableDate()).toEqual(tableDate);
		});

		it('should be able to generated the sorting object', function() {
			var order = "-FILTER_NAME";
			MatchesService.setSort(order);
			var sortObj = MatchesService._buildSortString();
			var expectedSort = '[("FILTER_NAME", -1)]';

			expect(sortObj).toEqual(expectedSort);
		});

		it('should be able to generate the match query', function() {
			var q = {
				FILTER_STATUS: MatchesService.getFilterStatus(),
				MATCH_STATUS: MatchesService.getMatchStatus(),
				TEAM_ID: MatchesService.getTeamId(),
				REPORT_DATE: {},
				FILTER_ID: {}
			};

			// Set date
			var dateMonths = 3;
			var cd = new Date();
			cd.setMonth(cd.getMonth() - parseInt(dateMonths));
			var expectedDateQuery = {
				'$gte': cd.toUTCString()
			};

			MatchesService.setTableDate(dateMonths);
			_.extend(q.REPORT_DATE, expectedDateQuery);

			// Set filters
			var tableFilters = ['FILTER_ID1', 'FILTER_ID2'];
			var expectedFilterQuery = {
				'$in': tableFilters
			};

			MatchesService.setTableFilters(tableFilters);
			_.extend(q.FILTER_ID, expectedFilterQuery);

			var resQ = MatchesService._buildMatchQuery();

			expect(resQ).toEqual(q);
		});
	});


	describe('Public methods', function () {
		it('should be able to fetch the matches', function () {
			var filterStatus = 1;
			MatchesService.setFilterStatus(filterStatus);
			expect(MatchesService.matchOpts.FILTER_STATUS).toEqual(filterStatus);

			spyOn(MatchesService, '_buildMatchQuery').and.callThrough();
			spyOn(MatchesService, '_buildSortString').and.callThrough();
			spyOn(MatchesService, '_buildMatchSearch').and.callThrough();
			spyOn(MatchesREST, 'findByStatus').and.returnValue({ $promise: MatchesRESTPromise});

			MatchesService.fetchMatches(1, false);

			expect(MatchesService._buildMatchQuery).toHaveBeenCalled();
			expect(MatchesService._buildSortString).toHaveBeenCalled();
			expect(MatchesService._buildMatchSearch).toHaveBeenCalled();

			// Before resolving isLoading is true
			expect(MatchesService.getIsLoading()).toBeTruthy();
			expect(MatchesREST.findByStatus).toHaveBeenCalled();
			scope.$digest();
		});

		it('should be able to get the match counts', function() {
			spyOn(UtilitiesService, 'countMatches').and.returnValue({ $promise: UtilitiesServicePromise });
			MatchesService.getCounts();
			expect(UtilitiesService.countMatches).toHaveBeenCalled();
		});

		it('should be able to generate the matchmap', function() {
			var mockMatches = MatchesMocks.mockMatchesResponse()._items;
			var matchMap = {};
			_.each(mockMatches, function(v) {
				matchMap[v._id] = v;
			});

			MatchesService.setMatches(mockMatches);
			MatchesService.updateMatchMap();

			var generatedMatchmap = MatchesService.matchMap;
			expect(matchMap).toEqual(generatedMatchmap);
		});

		it('should be able to generate reduced count map', function() {
			var tableFilters = ['FILTER_ID1', 'FILTER_ID2'];
			var resultObj = {
				'FILTER_ID1': {
					'new': 14,
					'deferred': 15,
					'on hold': 25
				},
				'FILTER_ID2': {
					'new': 2,
					'on hold': 9,
					'not eligible': 6
				},
				'FILTER_ID3': {
					'contacted': 12
				}
			};
			MatchesService.setTableFilters(tableFilters);
			var cmRes = MatchesService.getReducedCountMapForFilters(resultObj);

			// Only counts of filters 1 and 2
			var expectedObj = {
				'new': 16,
				'deferred': 15,
				'on hold': 34,
				'not eligible': 6
			};

			expect(cmRes).toEqual(expectedObj);
		});

		it('should return false when trying to updateStatus without any selected matches', function() {
			var ret = MatchesService.updateStatus([], 2);
			expect(ret).toBeFalsy();
		});

		it('should be able to update the status of several matches', function() {
			spyOn(MatchesService, '_promiseToUpdateMatch');
			var mockMatches = MatchesMocks.mockMatchesResponse()._items;
			MatchesService.setMatches(mockMatches);
			MatchesService.updateMatchMap();
			var ret = MatchesService.updateStatus(mockMatches, 4);

			var updatePromises = [];

			angular.forEach(mockMatches, function (match) {
				updatePromises.push(MatchesService._promiseToUpdateMatch(match, 4));
			});

			expect(ret).toEqual($q.all(updatePromises));
		});
	});

});
