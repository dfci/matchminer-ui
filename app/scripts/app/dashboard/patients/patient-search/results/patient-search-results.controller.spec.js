'use strict';

describe('Controller: PatientSearchResultsCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		document,
		mdDialog,
		$q,
		$stateParams,
		PatientsMocks,
		PatientsREST,
		PatientsService;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		inject(function ($controller, $rootScope, _$document_, _PatientsService_, _PatientsMocks_, _$state_, _$q_, _$mdDialog_) {
			scope = $rootScope.$new();
			state = _$state_;
			mdDialog = _$mdDialog_;
			$q = _$q_;
			rootScope = $rootScope;
			document = _$document_;

			PatientsService = _PatientsService_;
			PatientsMocks = _PatientsMocks_;

			$stateParams = {
				patient_id: "1234567890"
			};

			ctrl = $controller('PatientSearchResultsCtrl', {
				$scope: scope,
				$stateParams: $stateParams
			});

		});
	});

	it('should initialize with the patient service metadata', function() {
		var serviceMetadata = PatientsService.getMetadata();
		expect(ctrl.metadata).toBe(serviceMetadata);
	});

	it('should watch the patient service metadata collection for changes', function() {
		var initMetadata = PatientsService.getMetadata();
		expect(initMetadata.total_elements).toBe(0);
		expect(initMetadata.current_page).toBe(1);
		expect(initMetadata.page_size).toBe(10);

		// Update metadata
		var newMetadata = angular.copy(initMetadata);
		newMetadata.total_elements = 205;
		newMetadata.current_page = 2;
		newMetadata.page_size = 100;

		PatientsService.setMetadata(newMetadata);

		scope.$digest();
		expect(ctrl.metadata).toBe(newMetadata);
	});

	it('should watch the patient service results collection for non empty changes', function() {
		var initialResultSet = PatientsService.getResults();
		expect(initialResultSet.length).toEqual(0);
		expect(ctrl.patientsDisplay.length).toEqual(0);

		var newResults = {};
		var newPatient = PatientsMocks.mockPatientClinical();
		newResults[newPatient._id] = newPatient;

		PatientsService.setResults(newResults);

		scope.$digest();
		expect(ctrl.patientsDisplay.length).toBe(1);
		expect(ctrl.patientsDisplay).toEqual([newPatient]);
		expect(ctrl.numPatients).toBe(1);
	});

	it('should watch the patient service results collection for empty changes', function() {
		expect(ctrl.patientsDisplay.length).toEqual(0);
		PatientsService.setResults(null);
		scope.$digest();

		expect(ctrl.patientsDisplay).toBe(null);
		expect(ctrl.numPatients).toBe(null);
	});

	it('should be able to navigate to a patient record by id', function() {
		spyOn(state, 'go');
		spyOn(mdDialog, 'hide');

		var mockPatient = PatientsMocks.mockPatientClinical();
		ctrl.goToRecord(mockPatient._id);

		expect(mdDialog.hide).toHaveBeenCalled();
		expect(state.go).toHaveBeenCalledWith('patient', { patient_id: mockPatient._id });
	});

});

describe('Controller: PatientSearchResultsCtrl - Navigate to details', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		mdDialog,
		httpBackend,
		$q,
		PatientsMocks,
		PatientsService,
		queryPatientPromise;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		PatientsService = jasmine.createSpyObj('PatientsService', [
			'queryPatient',
			'getMetadata',
			'getLastSearchTerm',
			'getResults'
		]);

		module(function($provide) {
			$provide.value('PatientsService', PatientsService);
		});

		inject(function ($controller, $rootScope, _PatientsService_, _PatientsMocks_, _$state_, _$q_, _$mdDialog_, _$httpBackend_) {
			scope = $rootScope.$new();
			state = _$state_;
			mdDialog = _$mdDialog_;
			rootScope = $rootScope;
			$q = _$q_;
			httpBackend = _$httpBackend_;
			PatientsService = _PatientsService_;
			PatientsMocks = _PatientsMocks_;

			queryPatientPromise = $q.defer();

			PatientsService.queryPatient.and.returnValue(queryPatientPromise.promise);

			ctrl = $controller('PatientSearchResultsCtrl', {
				$scope: scope
			});

		});
	});

	it('should be able to retrieve a patient and navigate to the details for a patient with a single sample', function() {
		var e = new Event('fake-event');
		var patients = PatientsMocks.mockPatientClinical();
		var patient = patients[1];
		spyOn(state, 'go');

		ctrl.navigateToDetails(e, patient);
		queryPatientPromise.resolve(patient);

		scope.$digest();
		expect(state.go).toHaveBeenCalledWith('patient', { patient_id: patient._id });
	});

	it('should be able to retrieve a patient and navigate to the details for a patient with multiple samples', function() {
		spyOn(mdDialog, 'show');
		var e = new Event('fake-event');
		var patients = PatientsMocks.mockPatientClinical();
		var patient = patients[0];
		//var additionalPatient = PatientsMocks.mockPatientClinical();
		httpBackend.whenGET("scripts/app/dashboard/patients/patient-search/sample-select/patient-sample-select.html").respond(200, {});
		httpBackend.expectGET("scripts/app/dashboard/patients/patient-search/sample-select/patient-sample-select.html");

		//patient.RELATED = [];
		//patient.RELATED.push(additionalPatient);
		ctrl.navigateToDetails(e, patient);

		queryPatientPromise.resolve(patient);

		scope.$digest();

		var expectedSamples = patient.RELATED;
		expectedSamples.push(patient);

		expect(ctrl.sampleOptions).toEqual(expectedSamples);
		expect(mdDialog.show).toHaveBeenCalled();
	});

	it('should log an error when an error occurs in the queryPatient method', function() {
		spyOn(console, 'error');
		var e = new Event('fake-event');
		var patient = PatientsMocks.mockPatientClinical();
		ctrl.navigateToDetails(e, patient);

		var err = { "Error while retrieving patient": patient._id };
		queryPatientPromise.reject(err);
		scope.$digest();

		expect(console.error).toHaveBeenCalledWith("Error while querying patient record: ", err);
	});
});
