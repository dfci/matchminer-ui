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

describe('Controller: FiltersCtrl', function () {

	var ctrl,
		scope,
		rootScope,
		PatientsService;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		inject(function ($controller, $rootScope, _PatientsService_) {
			scope = $rootScope.$new();
			rootScope = $rootScope;
			PatientsService = _PatientsService_;

			ctrl = $controller('PatientSearchCtrl', {
				$scope: scope
			});
		});
	});

	it('to be able to search for a patient', function () {
		spyOn(PatientsService, 'setSearchTerm');
		spyOn(PatientsService, 'searchPatients');

		var searchTerm = "John Doe";
		ctrl.querySearch(searchTerm);
		expect(PatientsService.setSearchTerm).toHaveBeenCalledWith(searchTerm);
		expect(PatientsService.searchPatients).toHaveBeenCalled();
	});
});

