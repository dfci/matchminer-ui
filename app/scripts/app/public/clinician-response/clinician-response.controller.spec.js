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

describe('Clinician Response Controller', function () {
	var scope,
		ctrl,
		ClinicianResponseRest,
		ClinicianResponseRestPromise,
		ClinicianResponseMocks,
		stateParams,
		$log,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		ClinicianResponseRest = jasmine.createSpyObj('ClinicianResponseREST', [
			'get'
		]);

		module(function($provide) {
			$provide.value('ClinicianResponseREST', ClinicianResponseRest);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$q_, _$log_, _ClinicianResponseMocks_) {
			scope = _$rootScope_.$new();

			$q = _$q_;
			$log = _$log_;
			ClinicianResponseMocks = _ClinicianResponseMocks_;

			/**
			 * Setup promises
			 */
			ClinicianResponseRestPromise = $q.defer();

			stateParams = {
				id: '1234567890'
			};

			/**
			 * Define return values on function call
			 */
			ClinicianResponseRest.get.and.returnValue({$promise: ClinicianResponseRestPromise.promise });

			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("ClinicianResponseCtrl", {
				$scope: scope,
				$stateParams: stateParams
			});
		});
	});

	it('should perform a successful query against the ClinicianResponseRest', function() {
		ctrl.loadClinicianResponse(stateParams.id);
		expect(ctrl.isLoading).toBeTruthy();
		expect(ClinicianResponseRest.get).toHaveBeenCalledWith({id: stateParams.id, no_ml: 'true'});

		var response = ClinicianResponseMocks.mockResponse();
		ClinicianResponseRestPromise.resolve(response);

		scope.$digest();

		expect(ctrl.isLoading).toBeFalsy();
		expect(ctrl.response).toEqual(response);
	});

	it('should perform a failing query against the ClinicianResponseRest', function() {
		spyOn($log, 'warn');
		expect(ctrl.isLoading).toBeTruthy();
		ctrl.loadClinicianResponse(stateParams.id);

		expect(ClinicianResponseRest.get).toHaveBeenCalledWith({id: stateParams.id, no_ml: 'true'});

		var responseErr = ClinicianResponseMocks.mockResponseErr();
		ClinicianResponseRestPromise.reject(responseErr);

		scope.$digest();

		expect(ctrl.isLoading).toBeFalsy();
		expect(ctrl.response).toBeUndefined();
		expect(ctrl.error).toEqual(responseErr);
		expect($log.warn).toHaveBeenCalledWith("Err ", responseErr);
	});

	it('should return false when trying to load a clinician response without an id', function() {
		var ret = ctrl.loadClinicianResponse();
		expect(ret).toBeFalsy();

	});
});
