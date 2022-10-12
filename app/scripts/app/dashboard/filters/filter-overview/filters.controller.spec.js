'use strict';

describe('Controller: FiltersCtrl', function () {

	var ctrl,
		scope,
		rootScope,
		FiltersService,
		MatchesService,
		FiltersQueryPromise,
		FiltersUpdatePromise,
		FiltersMocks,
		UserAccount,
		ToastService,
		MatchminerApiSanitizer,
		$q,
		mdDialog,
		mdDialogPromise,
		$state,
		$httpBackend,
		$timeout;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		FiltersService = jasmine.createSpyObj('FiltersService', [
			'fetchFilters',
			'getFilters',
			'setFilters',
			'getTableOpts',
			'getIsLoading',
			'setIsLoading',
			'updateGenomicFilter',
			'setPage',
			'setPageSize',
			'setSort',
			'setTeamId'
		]);

		MatchesService = jasmine.createSpyObj('MatchesService', [
			'setTableFilters'
		]);

		module(function($provide) {
			$provide.value('FiltersService', FiltersService);
			$provide.value('MatchesService', MatchesService);
		});

		inject(function ($controller, $rootScope, _FiltersService_, _$q_, _$state_, _FiltersMocks_, _UserAccountMocks_, _ToastService_, _$mdDialog_, _$timeout_, _MatchminerApiSanitizer_, _$httpBackend_) {
			scope = $rootScope.$new();
			rootScope = $rootScope;
			$q = _$q_;
			$state = _$state_;
			$timeout = _$timeout_;
			$httpBackend = _$httpBackend_;
			mdDialog = _$mdDialog_;
			FiltersMocks = _FiltersMocks_;
			ToastService = _ToastService_;
			UserAccount = _UserAccountMocks_;
			MatchminerApiSanitizer = _MatchminerApiSanitizer_;

			/**
			 * Setup promises
			 */
			FiltersQueryPromise = $q.defer();
			FiltersUpdatePromise = $q.defer();

			FiltersService.fetchFilters.and.returnValue(FiltersQueryPromise.promise);
			FiltersService.updateGenomicFilter.and.returnValue(FiltersUpdatePromise.promise);

			var ctiUser = UserAccount.mockCtiAccount();

			ctrl = $controller('FiltersCtrl', {
				$scope: scope,
				'UserAccount': ctiUser
			});
		});
	});

	it('to be able to load a filter', function () {
		spyOn($state, 'go');
		var filters = FiltersMocks.mockFilters();
		var filter = filters._items[0];

		ctrl.loadEditGenomicFilter(filter);

		expect($state.go).toHaveBeenCalledWith('filter-edit', {id: filter._id });
	});

	it('should be able to fail to load a filter and show a warning', function() {
		spyOn(ToastService, 'warn');

		var filters = FiltersMocks.mockFilters();
		var filter = filters._items[0];
		delete filter._id;

		ctrl.loadEditGenomicFilter(filter);

		expect(ToastService.warn).toHaveBeenCalledWith("Unable to load filter. ");
	});

	it('should be able to create a new filter', function() {
		spyOn($state, 'go');

		ctrl.createNewFilter();
		expect($state.go).toHaveBeenCalledWith('filter-new');
	});

	it('should be able to populate the page metadata after the filter query has been executed', function() {
		var filters = FiltersMocks.mockFilters()._items;
		var res = {
			_meta: {
				total: 12,
				page: 1
			},
			_items: filters
		};

		ctrl._successFilterQuery(res);

		expect(ctrl.totalElements).toBe(12);

		expect(FiltersService.setFilters).toHaveBeenCalledWith(filters);
		expect(FiltersService.setIsLoading).toHaveBeenCalledWith(false);
	});

	it('should be able to handle a filter query failure', function() {
		var err = "An error occurred";
		spyOn(ToastService, 'warn');
		ctrl._handleError(err);

		expect(ctrl.isLoading).toBeFalsy();
		expect(ToastService.warn).toHaveBeenCalledWith("Error while fetching genomic filters.");
	});

	it('should be able to paginate', function() {
		var page = 1;
		var limit = 10;

		ctrl.onPaginationChange(page, limit);
		expect(FiltersService.setPage).toHaveBeenCalledWith(page);
		expect(FiltersService.setPageSize).toHaveBeenCalledWith(limit);
		expect(FiltersService.fetchFilters).toHaveBeenCalled();
	});


});

