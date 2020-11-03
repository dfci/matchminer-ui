'use strict';

/*
 * Cases to test:
 * - StateParams tests for isEmbedded and when the state holds an error
 * -
 */

describe('Clinical Trials Controller', function () {
	var scope,
		httpBackend,
		$state,
		ctrl,
		stateparams,
		ClinicalTrialsService,
		ElasticSearchService;

	beforeEach(function () {
		module("matchminerUiApp");

		var state = {
			current: {
				name: 'clinicaltrials.overview'
			},
			get: function() {} // Support Angulartics autoTrackFirstPage state get function
		};
		module(function($provide) {
			$provide.value($state, state);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _ClinicalTrialsService_, _ElasticSearchService_, _$state_, _$httpBackend_) {
			// Mock stateparams object with your error boolean
			stateparams = {
				error: true,
				embeddedSearch: true
			};

			ClinicalTrialsService = _ClinicalTrialsService_;
			ElasticSearchService = _ElasticSearchService_;
			$state = _$state_;
			httpBackend = _$httpBackend_;
			// you should be expecting the get request url from the controller, not the route
			scope = _$rootScope_.$new();
			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("ClinicalTrialsSearchCtrl", {$scope: scope, $stateParams: stateparams});
		});
	});

	// State params should have been loaded into the controller variables
	it('should set the isDisabled boolean when the state holds an error', function () {
		expect(ctrl.isDisabled).toBe(true);
	});

	it('should set the isEmbedded boolean when the stateparams have it set.', function () {
		expect(ctrl.isEmbedded).toBe(true);
	});

	it('should call the ClinicalTrialService when the user is performing a search. ', function () {
		var searchTerm = "";
		spyOn(ClinicalTrialsService, 'fullTextSearch');
		
		$state.current.name = 'clinicaltrials.overview';
		ctrl.searchTerm = searchTerm;
		ctrl.openAdvancedSearch = true;
		ctrl.search();
		expect(ClinicalTrialsService.fullTextSearch).toHaveBeenCalledWith({});
	});

	it('should clear the search term when an no string is argumented and then perform a search. ', function () {
		var searchTerm = "";
		spyOn(ClinicalTrialsService, 'fullTextSearch');
		spyOn(ElasticSearchService, 'setSearchTerm');

		$state.current.name = 'clinicaltrials.overview';
		ctrl.searchTerm = searchTerm;
		ctrl.openAdvancedSearch = true;
		ctrl.search();
		expect(ElasticSearchService.setSearchTerm).toHaveBeenCalledWith(null);
		expect(ClinicalTrialsService.fullTextSearch).toHaveBeenCalledWith({});
	});
});

describe('Clinical Trials Controller', function () {
	var scope,
		$state,
		ctrl;

	beforeEach(function () {
		module("matchminerUiApp");

		var state = {
			current: {
				name: 'dashboard'
			},
			go: function() {},
			get: function() {} // Support Angulartics autoTrackFirstPage state get function
		};

		module(function($provide) {
			$provide.value($state, state);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$state_) {
			$state = _$state_;
			// you should be expecting the get request url from the controller, not the route
			scope = _$rootScope_.$new();
			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("ClinicalTrialsSearchCtrl", {$scope: scope});
		});
	});

	it('should redirect to the clinical trials overview with a search term argument when not on that page. ', function () {
		spyOn($state, 'go');
		var searchTerm = {searchTerm: "", geneSearchTerm: "", diseaseCenterSearchTerm: "", tumorTypeSearchTerm: ""};
		ctrl.search(searchTerm);

		expect($state.go).toHaveBeenCalledWith('clinicaltrials.overview',
			{'searchTerm': null, 'geneSearchTerm': undefined, 'diseaseCenterSearchTerm': undefined, 'tumorTypeSearchTerm': undefined});
	});



});
