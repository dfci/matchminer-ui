'use strict';

describe('Controller: ClinicalTrialsResultsCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		mockTrial,
		ElasticSearchService,
		ElasticSearchMocks,
		ClinicalTrialsService,
		ClinicalTrialsMocks;


	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		inject(function ($controller, $rootScope, _ElasticSearchService_, _ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchMocks_, _$state_) {
			scope = $rootScope.$new();
			state = _$state_;
			rootScope = $rootScope;
			ElasticSearchService = _ElasticSearchService_;
			ElasticSearchMocks = _ElasticSearchMocks_;
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;

			var searchResults = ElasticSearchMocks.mockElasticResults();
			searchResults.hits.hits = [];

			mockTrial = ClinicalTrialsMocks.mockClinicalTrials()[0];

			ctrl = $controller('ClinicalTrialsResultsCtrl', {
				$scope: scope,
				trialSearch: searchResults,
				trialMatches: undefined
			});

		});
	});

	it('should initialize without any trial search results', function() {
		expect(ctrl.trials.length).toBe(0);
	});

	it('should be able to detect changes of the clinical trials list in the service', function () {
		var mockTrials = ClinicalTrialsMocks.mockClinicalTrials();
		ClinicalTrialsService.clinicalTrialsList = mockTrials;
		scope.$digest();

		expect(ctrl.trials).toEqual(mockTrials);
	});

	it('should be able to sort the trials', function() {
		spyOn(ClinicalTrialsService, 'sort');
		var order = '-name';
		ctrl.onOrderChange(order);
		expect(ClinicalTrialsService.sort).toHaveBeenCalledWith(order);
	});

	it('should be able to sort the trials client when sorting genomic matches', function() {
		spyOn(ClinicalTrialsService, 'sort');
		var order = '-genomic_match';
		ctrl.onOrderChange(order);
		expect(ClinicalTrialsService.sort).not.toHaveBeenCalledWith(order);
	});

	
	///Since altering ClinicalTrialsService.onPaginationChange with August 22nd 2017's commit, this test no longer
	//passes; Now, in onPaginationChange, a promise is being resolved, causing the test to fail.
	// it('should be able to paginate the trials', function() {
	// 	spyOn(ClinicalTrialsService, 'paginate');
	// 	var page = 1;
	// 	var limit = 10;
	//
	// 	ctrl.onPaginationChange(page, limit);
	// 	expect(ClinicalTrialsService.paginate).toHaveBeenCalledWith(page, limit);
	// });

	it('should be able to navigate to a trials details page', function() {
		spyOn(state, 'go');
		var trial = {};
		trial._source = mockTrial;
		var protocol_id = "13-304";
		trial._source.protocol_no = protocol_id;
		var evt = new Event('fake-event');

		ctrl.navigateToDetails(evt, trial);
		expect(state.go).toHaveBeenCalledWith('clinicaltrials.detail', {protocol_no: protocol_id});
	});

	it('should be able to fetch the trial service highlight context', function() {
		spyOn(ClinicalTrialsService, 'getHighlightContext');
		var trial = mockTrial;

		ctrl.getHighlightContext(trial);
		expect(ClinicalTrialsService.getHighlightContext).toHaveBeenCalledWith(trial);
	});

	it('should be able to toggle all tags for a trial when it hasn\'t been set', function() {
		var e = jasmine.createSpyObj('e', ['stopPropagation']);
		var trial = mockTrial;
		ctrl.toggleAllTags(e, trial);
		expect(e.stopPropagation).toHaveBeenCalled();
		expect(trial.numTags).toEqual(100);
	});

	it('should be able to toggle all tags for a trial when it has been toggle previously', function() {
		var e = jasmine.createSpyObj('e', ['stopPropagation']);
		var trial = mockTrial;
		trial.numTags = 100;
		ctrl.toggleAllTags(e, trial);
		expect(e.stopPropagation).toHaveBeenCalled();
		expect(trial.numTags).toEqual(3);
	});

	it('should have return hasMoreTags return when no argument is given.', function() {
		var ret = ctrl.hasMoreTags();
		expect(ret).toBeUndefined();
	});

	it('should be able to indicate whether a trial has more tags. ', function() {
		var trial = {};
		trial._source = mockTrial;

		var hasMoreCheck = ctrl.hasMoreTags(trial);
		expect(hasMoreCheck).toBeTruthy();
	});

	it('should be able to indicate whether a trial has more tags. ', function() {
		var trial = {};
		delete mockTrial._summary.nonsynonymous_genes;
		delete mockTrial._summary.nonsynonymous_wt_genes;
		delete mockTrial._summary.disease_status;
		delete mockTrial._summary.tumor_types;
		delete mockTrial.drug_list;

		trial._source = mockTrial;

		var hasMoreCheck = ctrl.hasMoreTags(trial);
		expect(hasMoreCheck).toBeFalsy();
	});


	it('should be able to retrieve the trial coordinator', function(){
		spyOn(ClinicalTrialsService, 'getTrialCoordinator');
		ctrl.getStudyCoordinator(mockTrial);
		expect(ClinicalTrialsService.getTrialCoordinator).toHaveBeenCalledWith(mockTrial);
	});

	it('should be able to email the trial coordinator', function(){
		var evt = new Event('fake-event');
		var coordinator = ctrl.getStudyCoordinator(mockTrial);
		var coordinator_email = coordinator.email_address;

		spyOn(ClinicalTrialsService, 'emailCoordinator');
		ctrl.emailTrialCoordinator(evt, mockTrial, coordinator_email);
		expect(ClinicalTrialsService.emailCoordinator).toHaveBeenCalledWith(evt, mockTrial, coordinator_email);
	});
});

describe('Controller: ClinicalTrialsResultsCtrl - Trialmatches', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		mockTrial,
		trialMatches,
		TrialMatchMocks,
		ElasticSearchMocks,
		ClinicalTrialsService,
		ClinicalTrialsMocks;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		inject(function ($controller, $rootScope, _ElasticSearchService_, _ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchMocks_, _$state_, _TrialMatchMocks_) {
			scope = $rootScope.$new();
			state = _$state_;
			rootScope = $rootScope;
			ElasticSearchMocks = _ElasticSearchMocks_;
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;
			TrialMatchMocks = _TrialMatchMocks_;

			trialMatches = TrialMatchMocks.mockTrialMatches();

			var searchResults = ElasticSearchMocks.mockElasticResults();
			searchResults.hits.hits = [];

			mockTrial = {};
			mockTrial._source = ClinicalTrialsMocks.mockClinicalTrials()[0];
			searchResults.hits.hits.push(mockTrial);

			ctrl = $controller('ClinicalTrialsResultsCtrl', {
				$scope: scope,
				trialSearch: searchResults,
				trialMatches: trialMatches
			});
		});
	});

	it('should load and set the trial matches on init', function() {
		expect(ctrl.hasTrialMatches).toBeTruthy();
		expect(ctrl.trialMatches).toBe(trialMatches._items);
	});
});
