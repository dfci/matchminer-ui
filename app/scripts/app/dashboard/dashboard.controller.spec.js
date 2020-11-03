'use strict';

describe('Dashboard Controller', function () {
	var scope,
		ctrl,
		StatusService,
		FiltersREST,
		UtilitiesService,
		StatusQueryPromise,
		FiltersRESTPromise,
		UtilitiesCountPromise,
		UserAccount,
		Principal,
		FiltersMocks,
		$log,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		StatusService = jasmine.createSpyObj('StatusService', [
			'query'
		]);

		FiltersREST = jasmine.createSpyObj('FiltersREST', [
			'findByQuery'
		]);

		UtilitiesService = jasmine.createSpyObj('UtilitiesService', [
			'countMatches'
		]);

		Principal = jasmine.createSpyObj('Principal', [
			'isAuthenticated'
		]);

		module(function($provide) {
			$provide.value('StatusService', StatusService);
			$provide.value('FiltersREST', FiltersREST);
			$provide.value('UtilitiesService', UtilitiesService);
			$provide.value('Principal', Principal);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _UserAccountMocks_, _$q_, _FiltersMocks_, _$log_) {
			scope = _$rootScope_.$new();

			$q = _$q_;
			$log = _$log_;
			UserAccount = _UserAccountMocks_;
			FiltersMocks = _FiltersMocks_;

			/**
			 * Setup promises
			 */
			StatusQueryPromise = $q.defer();
			FiltersRESTPromise = $q.defer();
			UtilitiesCountPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			StatusService.query.and.returnValue({$promise: StatusQueryPromise.promise });
			FiltersREST.findByQuery.and.returnValue({ $promise: FiltersRESTPromise.promise });
			UtilitiesService.countMatches.and.returnValue({ $promise: UtilitiesCountPromise.promise });
			Principal.isAuthenticated.and.returnValue(true);

			var ctiUser = UserAccount.mockCtiAccount();

			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("DashboardCtrl", {$scope: scope, UserAccount: ctiUser});
		});
	});

	it('should be able to load the data for a CTI User', function () {
		ctrl.loadCtiCounts();

		expect(Principal.isAuthenticated()).toBe(true);

		var curDate = new Date();

		/**
		 * Resolve with return value
		 */
		StatusQueryPromise.resolve({
			_items: [
				{
					id: 1,
					last_update: curDate,
					title: "Title"
				}
			]
		});

		UtilitiesCountPromise.resolve({
			'_id' : {
				'new': 15,
				'deferred': 120,
				'pending': 40,
				'enrolled': 2
			}
		});

		FiltersRESTPromise.resolve(FiltersMocks.mockFilters());
		scope.$digest();

		expect(ctrl.lastUpdated).toEqual(curDate);
		expect(ctrl.newMatchCount).toEqual(15);
		expect(ctrl.registeredFilters).toEqual(3);
	});

	it('should be able to log an error', function() {
		spyOn($log, 'error');

		var err = " logging an error";

		ctrl._handleError(err);
		expect(ctrl.error).toBeTruthy();
		expect($log.error).toHaveBeenCalledWith("An error occurred ", err);
	});

});
