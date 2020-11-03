'use strict';

describe('Dashboard Controller', function () {
	var scope,
		ctrl,
		PublicStatisticsService,
		PublicStatisticsPromise,
		stateParams,
		window,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		PublicStatisticsService = jasmine.createSpyObj('PublicStatisticsService', [
			'get'
		]);

		module(function($provide) {
			$provide.value('PublicStatisticsService', PublicStatisticsService);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$q_, _$window_, ENV) {
			scope = _$rootScope_.$new();
			window = _$window_;
			$q = _$q_;

			stateParams = {
				error: {
					'errorMessage': 'You are currently not authorized to access MatchMiner.',
					'errorDetails': 'If you have questions, please send an email to '+ ENV.resources.email + '.'
				}
			};

			/**
			 * Setup promises
			 */
			PublicStatisticsPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			PublicStatisticsService.get.and.returnValue({$promise: PublicStatisticsPromise.promise });

			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("HomeCtrl", {
				$scope: scope,
				$stateParams: stateParams
			});
		});
	});

	it('should be able to load an error message via stateParams', function() {
		expect(ctrl.errorMessage).toEqual(stateParams.errorMessage);
		expect(ctrl.errorDetails).toEqual(stateParams.errorDetails);
	});

	it('should be able to load the public statistics', function () {
		ctrl.loadPublicStatistics();

		var statistics_response = {
			_items: [{
				num_clinical_trials: 150,
				num_patients: 12100
			}]
		};

		PublicStatisticsPromise.resolve(statistics_response);
		scope.$digest();

		expect(ctrl.public_stats).toEqual(statistics_response._items[0]);
	});

});
