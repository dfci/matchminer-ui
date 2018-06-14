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

describe('Controller: PatientDetailsCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		document,
		mdDialog,
		httpBackend,
		$q,
		$stateParams,
		cnvPromise,
		svPromise,
		mutationPromise,
		signaturePromise,
		NegativeGenomicREST,
		negativeGenomicsPromise,
		ElasticSearchMocks,
		ElasticSearchService,
		PatientsMocks,
		PatientsREST,
		PatientsService,
		UserAccount;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		PatientsREST = jasmine.createSpyObj('PatientsREST', [
			'queryGenomic'
		]);

		NegativeGenomicREST = jasmine.createSpyObj('NegativeGenomicREST', [
			'queryWhere'
		]);

		module(function($provide) {
			$provide.value('PatientsREST', PatientsREST);
			$provide.value('NegativeGenomicREST', NegativeGenomicREST);
		});

		inject(function ($controller, $rootScope, _$document_, _PatientsService_, _PatientsMocks_, _ElasticSearchService_, _ElasticSearchMocks_, _$state_, _$q_, _$mdDialog_, _$httpBackend_, _UserAccountMocks_) {
			scope = $rootScope.$new();
			state = _$state_;
			$q = _$q_;
			rootScope = $rootScope;
			document = _$document_;
			mdDialog = _$mdDialog_;
			httpBackend = _$httpBackend_;

			PatientsService = _PatientsService_;
			PatientsMocks = _PatientsMocks_;

			ElasticSearchService = _ElasticSearchService_;
			ElasticSearchMocks = _ElasticSearchMocks_;

			UserAccount = _UserAccountMocks_;

			/**
			 * Setup promises
			 */
			cnvPromise = $q.defer();
			svPromise = $q.defer();
			mutationPromise = $q.defer();
			signaturePromise = $q.defer();
			negativeGenomicsPromise = $q.defer();

			var searchResults = ElasticSearchMocks.mockElasticResults();
			searchResults.hits.hits = [];

			var patient = PatientsMocks.mockPatientClinical();

			$stateParams = {
				patient_id: "1234567890"
			};

			var ctiUser = UserAccount.mockCtiAccount();

			ctrl = $controller('PatientDetailsCtrl', {
				$scope: scope,
				trialSearch: searchResults,
				trialMatches: undefined,
				patient: null,
				$stateParams: $stateParams,
				UserAccount: ctiUser
			});

		});
	});

	it('should be able to return the contact template path', function() {
		var expectedContact = "scripts/app/dashboard/patients/patient-details/templates/contact.html";
		var contactPath = ctrl.getContact();
		expect(contactPath).toEqual(expectedContact);
	});

	it('should return a valid filepath for the allowed methodologies', function() {
		var fp = ctrl.getMethodology(1);
		var expectedV1 = "scripts/app/dashboard/patients/patient-details/templates/methodology-v1.html";
		expect(fp).toEqual(expectedV1);
	});

	it('should return a invalid filepath when the methodology panel isnt available', function() {
		var fp = ctrl.getMethodology(5);
		var invalidPath = "scripts/app/dashboard/patients/patient-details/templates/methodology_notfound.html";
		expect(fp).toEqual(invalidPath);
	});

	it('should be able to load the patient details', function() {

		// todo enable this unit test with issue #424 bugfix
		// todo https://gitlab-bcb.dfci.harvard.edu/knowledge-systems/matchminer-ui/issues/424

		// Mock patient
		var patients = PatientsMocks.mockPatientClinical();
		var patient = patients[0];

		// Init call already performed on controller load
		PatientsREST.queryGenomic.and.returnValues(
			{ $promise: cnvPromise.promise },
			{ $promise: mutationPromise.promise },
			// { $promise: signaturePromise.promise },
			{ $promise: svPromise.promise }
		);

		NegativeGenomicREST.queryWhere.and.returnValue({
			$promise: negativeGenomicsPromise.promise
		});

		spyOn(ctrl, '_queryGenomicByVariantCategory').and.callThrough();
		spyOn(ctrl, '_queryNegativeGenomic').and.callThrough();

		// ctrl.loadPatientDetails(patient);

		// expect(ctrl._queryGenomicByVariantCategory).toHaveBeenCalledWith($stateParams.patient_id, "sample 01", "CNV");
		// expect(ctrl._queryGenomicByVariantCategory).toHaveBeenCalledWith($stateParams.patient_id, "sample 01", "MUTATION");
		// expect(ctrl._queryGenomicByVariantCategory).toHaveBeenCalledWith($stateParams.patient_id, "sample 01", "SIGNATURE");
		// expect(ctrl._queryGenomicByVariantCategory).toHaveBeenCalledWith($stateParams.patient_id, "sample 01", "SV");
		// expect(ctrl._queryNegativeGenomic).toHaveBeenCalledWith($stateParams.patient_id, "sample 01");

		var mockNegGen = PatientsMocks.mockNegativeGenomic();

		// Resolve with mock responses
		cnvPromise.resolve(PatientsMocks.mockGenomicCNV());
		mutationPromise.resolve(PatientsMocks.mockGenomicMutation());
		// signaturePromise.resolve(PatientsMock.mockGenomicSignature());
		svPromise.resolve(PatientsMocks.mockGenomicSV());
		negativeGenomicsPromise.resolve(mockNegGen);

		// Digest the cycle
		scope.$digest();

		var expectedNPLC = {
			AURKA: {
				entry: [mockNegGen._items[0]],
				codons: [],
				exons: [4],
				entire_gene: []
			}
		};

		var expectedPLC = {
			MAP3K1: {
				entry: [mockNegGen._items[1]],
				codons: [],
				exons: [1],
				entire_gene: []
			}
		};

		var expectedPN = {
			AKT1: {
				entry: [mockNegGen._items[2]],
				codons: [17],
				exons: [],
				entire_gene: []
			}
		};

		// Expect all values to have been set in $q.spread (callback)
		// expect(ctrl.patient.cnvMut).toEqual(PatientsMocks.mockGenomicCNV()._items);
		// expect(ctrl.patient.transformedNegativeGenomics.NPLC).toEqual(expectedNPLC);
		// expect(ctrl.patient.transformedNegativeGenomics.PLC).toEqual(expectedPLC);
		// expect(ctrl.patient.transformedNegativeGenomics.PN).toEqual(expectedPN);
		// expect(ctrl.patient.svMut).toEqual(PatientsMocks.mockGenomicSV()._items);
	});

	it('should be able to show a modal dialog for a multi sample select', function() {
		var patients = PatientsMocks.mockPatientClinical();
		var patient = patients[0];
		spyOn(mdDialog, 'show');
		httpBackend.expectGET("scripts/app/dashboard/patients/patient-search/sample-select/patient-sample-select.html");

		ctrl.sampleSelect(patient);
		expect(ctrl.sampleOptions.length).toBe(2);
		expect(mdDialog.show).toHaveBeenCalled();
	});
});
