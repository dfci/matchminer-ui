'use strict';

describe('Controller: MatchesCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		TEMPLATES,
		UserAccount,
		MatchesService,
		MatchesPromise,
		FiltersService,
		FiltersQueryPromise,
		FiltersREST,
		FiltersRESTPromise,
		MatchesMocks,
		FiltersMocks,
		$window,
		$q,
		mockMatchesResponse,
		mockFilters,
		Mailto;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		FiltersREST = jasmine.createSpyObj('FiltersREST', [
			'findByQuery'
		]);

		FiltersService = jasmine.createSpyObj('FiltersService', [
			'fetchFilters'
		]);

		MatchesService = jasmine.createSpyObj('MatchesService', [
			'fetchMatches',
			'getCounts',
			'getTableOpts',
			'getTableFilter',
			'getMatches',
			'setMatches',
			'updateMatchMap',
			'updateStatus',
			'getMatchStatus',
			'setTeamId',
			'setSort',
			'setPage',
			'setPageSize',
			'setTableFilters',
			'setTableDate',
			'getIsLoading',
			'setIsLoading',
			'getReducedCountMapForFilters',
			'addMatchSearchTerm',
			'removeMatchSearchTerm',
			'setLastResponse',
			'getMatchSearchTerms'
		]);

		module(function($provide) {
			$provide.value('FiltersService', FiltersService);
			$provide.value('FiltersREST', FiltersREST);
			$provide.value('MatchesService', MatchesService);
		});

		inject(function ($controller, $rootScope, _$q_, _Mailto_, _TEMPLATES_, _UserAccountMocks_, _$window_, _MatchesService_, _MatchesMocks_, _FiltersService_, _FiltersMocks_, _$state_) {
			scope = $rootScope.$new();
			state = _$state_;
			rootScope = $rootScope;
			Mailto = _Mailto_;
			$q = _$q_;
			$window = _$window_;
			TEMPLATES = _TEMPLATES_;
			UserAccount = _UserAccountMocks_;
			MatchesMocks = _MatchesMocks_;
			FiltersMocks = _FiltersMocks_;

			mockMatchesResponse = MatchesMocks.mockMatchesResponse();
			mockFilters = FiltersMocks.mockFilters();

			/**
			 * Setup promises
			 */
			FiltersQueryPromise = $q.defer();
			FiltersService.fetchFilters.and.returnValue({ $promise: FiltersQueryPromise.promise });

			MatchesPromise = $q.defer();
			MatchesService.fetchMatches.and.returnValue( MatchesPromise.promise );
			MatchesService.updateStatus.and.returnValue( MatchesPromise.promise );
			MatchesService.getCounts.and.returnValue( MatchesPromise.promise );
			MatchesService.getMatchStatus.and.returnValue(0);

			FiltersRESTPromise = $q.defer();
			FiltersREST.findByQuery.and.returnValue( { $promise: FiltersRESTPromise.promise });

			/**
			 * Define return values on function call
			 */
			var ctiUser = UserAccount.mockCtiAccount();

			ctrl = $controller('MatchesCtrl', {
				$scope: scope,
				UserAccount: ctiUser
			});

			ctrl.tableFilter = {
				date: null,
				filters: null
			}

		});
	});

	it('should be able to email an investigator', function() {
		spyOn($window, 'open');
		var evt = jasmine.createSpyObj('e', ['stopPropagation', 'preventDefault']);
		var mockResponse = MatchesMocks.mockMatchesResponse();
		var match = mockResponse._items[0];

		var opts = {
			subject: match.EMAIL_SUBJECT,
			body: match.EMAIL_BODY
		};

		ctrl.emailProvider(evt, match);

		expect(evt.stopPropagation).toHaveBeenCalled();
		expect(evt.preventDefault).toHaveBeenCalled();
		expect($window.open).toHaveBeenCalledWith(Mailto.url(match.EMAIL_ADDRESS, opts), '_self');
	});

	it('should be able to load counts', function() {
		ctrl._loadCounts();
		expect(MatchesService.getCounts).toHaveBeenCalled();
	});

	it('should be able to navigate to the patient details', function() {
		var evt = jasmine.createSpyObj('e', ['stopPropagation']);
		var patient_id = "1234567890";
		var match = { CLINICAL_ID: { _id: patient_id } };

		spyOn(state, 'go');

		ctrl.gotoPatientDetails(evt, match);
		expect(evt.stopPropagation).toHaveBeenCalled();
		expect(state.go).toHaveBeenCalledWith('patient', { patient_id: patient_id });
	});

	it('should be able to handle a match load success', function() {
		var mockResponse = MatchesMocks.mockMatchesResponse();
		ctrl._handleSuccess(mockResponse);

		expect(MatchesService.setMatches).toHaveBeenCalledWith(mockResponse._items);
		expect(MatchesService.updateMatchMap).toHaveBeenCalled();
	});

	it('should be able to handle a match count success', function() {
		ctrl._handleCountSuccess();
		expect(MatchesService.getReducedCountMapForFilters).toHaveBeenCalled();
		expect(MatchesService.setIsLoading).toHaveBeenCalledWith(false);
	});

	it('should be able to handle a match load error', function() {
		ctrl._handleError();
		expect(MatchesService.setIsLoading).toHaveBeenCalledWith(false);
	});

	it('should be able to successfully handle an update', function() {
		spyOn(ctrl, '_loadMatches');

		ctrl._successUpdate();
		expect(ctrl.matchStatusUpdate).toBeNull();
		expect(ctrl._loadMatches).toHaveBeenCalledWith(0, true);
	});

	it('should be able to update a status', function() {
		var newStatus = 5;
		var selectedMatches = MatchesMocks.mockMatchesResponse()._items;
		ctrl.updateStatus(selectedMatches, newStatus);
		expect(MatchesService.updateStatus).toHaveBeenCalledWith(selectedMatches, newStatus);
	});

	it('should be able to add a searchTerm ', function() {
		var term = "Glioblastoma";
		ctrl.onSearchAdd(term);
		expect(MatchesService.setPage).toHaveBeenCalledWith(1);
		expect(MatchesService.addMatchSearchTerm).toHaveBeenCalledWith(term);
		expect(MatchesService.fetchMatches).toHaveBeenCalledWith(MatchesService.getMatchStatus(), true);
	});

	it('should be able to remove a searchTerm', function() {
		var term = "Glioblastoma";
		ctrl.onSearchRemove(term);
		expect(MatchesService.setPage).toHaveBeenCalledWith(1);
		expect(MatchesService.removeMatchSearchTerm).toHaveBeenCalledWith(term);
		expect(MatchesService.fetchMatches).toHaveBeenCalledWith(MatchesService.getMatchStatus(), true);
	});

	it('should be able to handle column ordering', function(){
		var order = "-FILTER_NAME";
		ctrl.onOrderChange(order);
		expect(MatchesService.setSort).toHaveBeenCalledWith(order);
		expect(MatchesService.fetchMatches).toHaveBeenCalledWith(MatchesService.getMatchStatus(), true);
	});

	it('should be able to handle pagination', function() {
		var page = 2;
		var limit = 10;

		ctrl.onPaginationChange(page, limit);

		expect(MatchesService.setPage).toHaveBeenCalledWith(page);
		expect(MatchesService.setPageSize).toHaveBeenCalledWith(limit);
		expect(MatchesService.fetchMatches).toHaveBeenCalledWith(MatchesService.getMatchStatus(), true);
	});

	it('should be able to load the filters', function() {
		spyOn(ctrl, '_loadFilters');

		var q = { where: angular.toJson(ctrl.filtersQuery) };
		expect(FiltersREST.findByQuery).toHaveBeenCalledWith(q);

		FiltersRESTPromise.resolve(mockFilters);

		scope.$digest();
		expect(ctrl.filters).toEqual(mockFilters._items);
	});

	it('should get the selected filter text for all filters', function() {
		var ret = ctrl.getSelectedFilterText();
		expect(ret).toEqual("All filters");
	});

	it('should get the selected filter text for a selection a single filter', function() {
		ctrl.tableFilter.filter = ['FILTER_ID1'];
		var ret = ctrl.getSelectedFilterText();
		expect(ret).toEqual("<span class='md-red'>1 filter selected</span>");
	});

	it('should get the selected filter text for a selection a multiple filter', function() {
		ctrl.tableFilter.filter = ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3'];
		var ret = ctrl.getSelectedFilterText();
		expect(ret).toEqual("<span class='md-red'>3 filters selected</span>");
	});

	it('should return the correct text when fetching the text for all dates option selected.', function() {
		ctrl.tableFilter.date = 'all';
		var ret = ctrl.getSelectedDateText();
		expect(ret).toEqual('All time');
	});

	it('should return the correct text when fetching the text for the date select dropdown.', function() {
		var ret = ctrl.getSelectedDateText();
		expect(ret).toEqual('All time');
	});

	it('should return the correct text when fetching the text for a 6 month date offset in select dropdown.', function() {
		ctrl.tableFilter.date = 6;
		var ret = ctrl.getSelectedDateText();
		var expectedRet = "<span class='md-red'>Within the past 6 months</span>";
		expect(ret).toEqual(expectedRet);
	});

	it('should return the correct text when fetching the text for a 1 month date offset in select dropdown.', function() {
		ctrl.tableFilter.date = 1;
		var ret = ctrl.getSelectedDateText();
		var expectedRet = "<span class='md-red'>Within the past 1 month</span>";
		expect(ret).toEqual(expectedRet);
	});

	it('should return false when calling a genomic filter filter without a selected filter', function() {
		var ret = ctrl.closeFilterSelect();
		expect(ret).toBeFalsy();
	});

	it('should be able to filter the matches by genomic filter', function() {
		var filterSelection = ['FILTER_ID1', 'FILTER_ID2', 'FILTER_ID3'];
		ctrl.tableFilter.filter = filterSelection;

		spyOn(ctrl, '_loadMatches');
		ctrl.closeFilterSelect();

		expect(MatchesService.setTableFilters).toHaveBeenCalledWith(filterSelection);
		expect(ctrl._loadMatches).toHaveBeenCalledWith(0, true);
	});

	it('should delete the filter selection when the array is empty', function() {
		ctrl.tableFilter.filters = null;
		spyOn(ctrl, '_loadMatches');
		ctrl.closeFilterSelect();

		expect(MatchesService.setTableFilters).toHaveBeenCalledWith([]);
		expect(ctrl._loadMatches).toHaveBeenCalledWith(0, true);
	});

	it('should return false when calling a date filter without a date selection', function() {
		var ret = ctrl.closeDateSelect();
		expect(ret).toBeFalsy();
	});

	it('should be able to switch to all date filtering', function() {
		spyOn(ctrl, '_loadMatches');
		ctrl.tableFilter.date = 'all';
		ctrl.closeDateSelect();
		expect(MatchesService.setTableDate).toHaveBeenCalledWith(null);
		expect(ctrl._loadMatches).toHaveBeenCalledWith(0, true);
	});

	it('should be able to select and filter for a specific date range', function() {
		ctrl.tableFilter.date = 6;
		spyOn(ctrl, '_loadMatches');
		ctrl.closeDateSelect();
		expect(MatchesService.setTableDate).toHaveBeenCalledWith(6);
		expect(ctrl._loadMatches).toHaveBeenCalledWith(0, true);
	});

	it('should be able to indicate if a match is contactable', function() {
		var mockMatches = mockMatchesResponse._items;
		var contactableMatch = mockMatches[0];
		var ret = ctrl.isContactable(contactableMatch);

		expect(ret).toBeTruthy();
	});

	it('should be able to indicate if a match is not contactable', function() {
		var mockMatches = mockMatchesResponse._items;
		var nonContactableMatch = mockMatches[1];
		var ret = ctrl.isContactable(nonContactableMatch);

		expect(ret).toBeFalsy();
	});

});
