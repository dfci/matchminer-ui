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

