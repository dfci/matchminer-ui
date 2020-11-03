'use strict';

describe('Statistics Controller', function () {
	var scope,
		ctrl,
		StatisticsService,
		StatisticsPromise,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		StatisticsService = jasmine.createSpyObj('StatisticsService', [
			'get'
		]);

		module(function($provide) {
			$provide.value('StatisticsService', StatisticsService);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$q_, _$window_) {
			scope = _$rootScope_.$new();
			$q = _$q_;

			/**
			 * Setup promises
			 */
			StatisticsPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			StatisticsService.get.and.returnValue({$promise: StatisticsPromise.promise });

			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("StatisticsCtrl", {
				$scope: scope
			});
		});
	});

	it('should be able to load the statistics', function () {
		expect(ctrl.isLoading).toBeTruthy();
		spyOn(ctrl, 'createDataTables').and.callThrough();
		spyOn($.fn, 'DataTable');
		ctrl.loadStatistics();

		var statistics_response = {
			_items: [{
				mm_data_set: {

				},
				active_user_data_set: {

				},
				inactive_user_data_set: {

				},
				active_filter_data_set: {

				}
			}]
		};

		StatisticsPromise.resolve(statistics_response);
		scope.$digest();

		expect(ctrl.createDataTables).toHaveBeenCalledWith(
			statistics_response['_items'][0]['mm_data_set'],
			statistics_response['_items'][0]['active_user_data_set'],
			statistics_response['_items'][0]['inactive_user_data_set'],
			statistics_response['_items'][0]['active_filter_data_set']
		);
		expect($('#mmStats').DataTable).toHaveBeenCalled();
		expect($('#activeUserStats').DataTable).toHaveBeenCalled();
		expect($('#inactiveUserStats').DataTable).toHaveBeenCalled();
		expect($('#activeFilterStats').DataTable).toHaveBeenCalled();
		expect(ctrl.isLoading).toBeFalsy();
	});

	it('should be able to load the statistics', function () {
		expect(ctrl.isLoading).toBeTruthy();

		ctrl.loadStatistics();

		var statistics_response = {
			_items: []
		};

		StatisticsPromise.resolve(statistics_response);
		scope.$digest();

		expect(ctrl.isLoading).toBeFalsy();
	});

});
