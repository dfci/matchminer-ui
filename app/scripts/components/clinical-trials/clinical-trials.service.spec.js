'use strict';

describe('Clinical Trials Service Unit Tests', function () {
	// Setup
	var ClinicalTrialsService,
		ClinicalTrialsMocks,
		ElasticSearchMocks,
		ClinicalTrialsREST;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(
		inject(function (_ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchMocks_, _ClinicalTrialsREST_) {
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;
			ElasticSearchMocks = _ElasticSearchMocks_;
			ClinicalTrialsREST = _ClinicalTrialsREST_;
		})
	);

	it('should initialize with default metadata descriptors', function () {
		expect(ClinicalTrialsService.metadata.current_page).toBe(1);
		expect(ClinicalTrialsService.metadata.total_elements).toBe(0);
	});

	it('should be able to empty set clinical trials', function () {
		ClinicalTrialsService.clinicalTrialsList = ClinicalTrialsMocks.mockClinicalTrials();
		expect(ClinicalTrialsService.clinicalTrialsList.length).toBeGreaterThan(0);
		ClinicalTrialsService.emptyAll();
		expect(ClinicalTrialsService.clinicalTrialsList.length).toBe(0);
	});

	it('should be able to retrieve set clinical trials', function () {
		ClinicalTrialsService.clinicalTrialsList = ClinicalTrialsMocks.mockClinicalTrials();
		expect(ClinicalTrialsService.getAll().length).toEqual(1);
	});

	it('should get clinical trial', function () {

		var testClinicalTrialId = "12-234";
		var testPromise = new Promise(function () {

		});
		var testResult = {$promise: testPromise};
		spyOn(ClinicalTrialsREST, 'findById').and.returnValue(testResult);
		var result = ClinicalTrialsService.getTrial(testClinicalTrialId);
		expect(ClinicalTrialsREST.findById).toHaveBeenCalledWith({where: {protocol_no: testClinicalTrialId}});
		expect(result).toEqual(testPromise);
	});

	it('should be able to set a clinicial trial in the service', function() {
		var trials = ClinicalTrialsMocks.mockClinicalTrials();
		var trial = trials[0];

		ClinicalTrialsService.setTrial(trial);
		expect(ClinicalTrialsService.trial).toEqual(trial);
	});

	it('should be able to reset the service to its starting state', function() {
		ClinicalTrialsService.reset();
		expect(ClinicalTrialsService.getAll()).toEqual([]);
		var _metadata = ClinicalTrialsService.getMetadata();
		expect(_metadata.total_elements).toBe(0);
		expect(_metadata.current_page).toBe(1);
	});
});

describe('Search functionality unit tests', function () {
	// Setup
	var ClinicalTrialsService,
		ClinicalTrialsMocks,
		ElasticSearchService,
		ElasticSearchPromise,
		ElasticSearchMocks,
		$window,
		Mailto,
		TEMPLATES,
		$q,
		scope,
		$timeout;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(function () {
		inject(function (_ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchService_, _ElasticSearchMocks_, _$q_, _$rootScope_, _$timeout_, _$window_, _Mailto_, _TEMPLATES_) {
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;
			ElasticSearchService = _ElasticSearchService_;
			ElasticSearchMocks = _ElasticSearchMocks_;
			$q = _$q_;
			var rootScope = _$rootScope_;
			scope = rootScope.$new();
			$timeout = _$timeout_;
			$window = _$window_;
			Mailto = _Mailto_;
			TEMPLATES = _TEMPLATES_;

			ElasticSearchPromise = $q.defer();

		})
	});

	it('should return false when no argument is given', function () {
		var res = ClinicalTrialsService.updateMetadata();
		expect(res).toBeFalsy();
	});

	it('should be able to update the service metadata using the elasticsearch response', function () {
		// Set mock response object
		var result = ElasticSearchMocks.mockMetadataResponse();

		// Set spies
		spyOn(ElasticSearchService, 'getSearchFrom');
		spyOn(ElasticSearchService, 'getSearchSize');
		spyOn(ElasticSearchService, 'getSearchSort');

		ClinicalTrialsService.updateMetadata(result);
		expect(ElasticSearchService.getSearchFrom).toHaveBeenCalled();
		expect(ElasticSearchService.getSearchSize).toHaveBeenCalled();
		expect(ElasticSearchService.getSearchSort).toHaveBeenCalled();

		expect(ClinicalTrialsService.metadata.total_elements).toEqual(50);
		expect(ClinicalTrialsService.metadata.time_taken).toEqual(2);
		expect(ClinicalTrialsService.metadata.max_score).toEqual(1);
		expect(ClinicalTrialsService.metadata.is_timed_out).toEqual(false);
	});

	it('should be able to retrieve the metadata', function () {
		// Make sure metadata is set.
		var result = ElasticSearchMocks.mockMetadataResponse();
		ClinicalTrialsService.updateMetadata(result);

		var metadata = ClinicalTrialsService.getMetadata();
		expect(metadata.total_elements).toEqual(50);
		expect(metadata.time_taken).toEqual(2);
		expect(metadata.max_score).toEqual(1);
		expect(metadata.is_timed_out).toEqual(false);
	});

	it('should be able to update the filter categories', function () {
		// Set aggregators retrieved from the ElasticSearchMocks.
		var aggregators = ElasticSearchMocks.getAggregators();
		var orderedAggregators = ['gene_(mutant)', 'phase'];
		ClinicalTrialsService.orderedAggregations = orderedAggregators;

		spyOn(ClinicalTrialsService, 'updateFilterCategories').and.callThrough();
		ClinicalTrialsService.updateFilterCategories(aggregators);
		expect(ClinicalTrialsService.updateFilterCategories).toHaveBeenCalledWith(aggregators);

		var filterCategories = ClinicalTrialsService.getFilterCategories();

		// Two filters should have been defined
		expect(filterCategories.length).toEqual(2);

		// Tests for formatted filterCategories.
		expect(filterCategories[0].name).toEqual('Gene (Mutant)');
		expect(filterCategories[0].aggregator).toEqual('_summary.nonsynonymous_genes');
		expect(filterCategories[0].options.length).toEqual(2);
	});

	it('should be able to retrieve the filter categories', function () {
		// Set aggregators retrieved from the ElasticSearchMocks.
		var aggregators = ElasticSearchMocks.getAggregators();
		ClinicalTrialsService.orderedAggregations = ['gene_(mutant)', 'phase'];
		ClinicalTrialsService.updateFilterCategories(aggregators);
		var filterCategories = ClinicalTrialsService.getFilterCategories();

		// Two filters should have been defined
		expect(filterCategories.length).toEqual(2);
	});

	// it('should be able to perform a full text search', function () {
	// 	// Mock actual function call for ElasticSearchService.search
	// 	var data = ElasticSearchMocks.mockElasticResults();
	//
	// 	spyOn(ElasticSearchService, 'search').and.returnValue(ElasticSearchPromise.promise);
	// 	spyOn(ElasticSearchService, 'clearSearchSort');
	// 	spyOn(ElasticSearchService, 'setSearchTerm');
	//
	// 	spyOn(ClinicalTrialsService, 'updateMetadata');
	// 	spyOn(ClinicalTrialsService, 'updateFilterCategories');
	//
	// 	var testTerm = "BRCA";
	// 	ClinicalTrialsService.fullTextSearch(testTerm);
	//
	// 	expect(ClinicalTrialsService.isLoading).toBeTruthy();
	// 	expect(ElasticSearchService.getSearchType()).toBe('trial');
	// 	expect(ElasticSearchService.clearSearchSort).toHaveBeenCalled();
	// 	expect(ElasticSearchService.setSearchTerm).toHaveBeenCalledWith(testTerm);
	//
	// 	ElasticSearchPromise.resolve(data);
	// 	scope.$digest();
	//
	// 	expect(ClinicalTrialsService.updateFilterCategories).toHaveBeenCalledWith(data.aggregations);
	// 	expect(ClinicalTrialsService.updateMetadata).toHaveBeenCalledWith(data);
	// 	expect(ClinicalTrialsService.isLoading).toBeFalsy();
	// });

	it('should be able to catch an error while trying a full text search', function () {
		// Mock actual function call for ElasticSearchService.search
		var data = ElasticSearchMocks.mockElasticResults();

		spyOn(ElasticSearchService, 'search').and.returnValue(ElasticSearchPromise.promise);

		var testTerm = "BRCA";
		ClinicalTrialsService.fullTextSearch(testTerm);

		expect(ClinicalTrialsService.isLoading).toBeTruthy();

		ElasticSearchPromise.reject(data);
		scope.$digest();

		expect(ClinicalTrialsService.isLoading).toBeFalsy();
	});

	it('should return the active filters that have been set', function () {
		// Set filters
		var f = ClinicalTrialsMocks.getFilter();
		ClinicalTrialsService.filters.push(f);

		// Retrieve filters
		expect(ClinicalTrialsService.getFilters().length).toEqual(1);
	});

	it('should initialize with an empty filter list.', function () {
		var filters = ClinicalTrialsService.getFilters();
		expect(filters.length).toBe(0);
	});

	it('should be able to perform search result pagination', function () {
		var next_page = 3;
		var page_size = 25;

		// Set method spies
		spyOn(ClinicalTrialsService, 'paginate').and.callThrough();
		spyOn(ElasticSearchService, 'setSearchSize');
		spyOn(ElasticSearchService, 'setSearchFrom');
		spyOn(ClinicalTrialsService, 'fullTextSearch');

		// Call the method
		ClinicalTrialsService.paginate(next_page, page_size);
		expect(ElasticSearchService.setSearchSize).toHaveBeenCalledWith(page_size);

		// Set search range start
		var searchFrom = (next_page - 1) * page_size;
		expect(ElasticSearchService.setSearchFrom).toHaveBeenCalledWith(searchFrom);
		expect(ClinicalTrialsService.fullTextSearch).toHaveBeenCalled();
	});

	it('should be able to perform search result sorting', function () {
		// Order by descending status field
		var order = "-status";
		spyOn(ElasticSearchService, 'setSearchSort');
		spyOn(ClinicalTrialsService, 'fullTextSearch');

		ClinicalTrialsService.sort(order);
		expect(ElasticSearchService.setSearchSort).toHaveBeenCalledWith(order);

		ElasticSearchService.getSearchSort();
		expect(ClinicalTrialsService.fullTextSearch).toHaveBeenCalled();
	});

	it('should be able to toggle active search filters', function () {
		// searchFilter
		var filterName = 'Phase';
		var aggregator = '_summary.phase.value';
		var value = '1';
		var optionName = 'Phase 1';

		// Simulate that the search filter isn't active
		spyOn(ClinicalTrialsService, 'fullTextSearch');
		spyOn(ClinicalTrialsService, 'isActiveFilter').and.callThrough();
		ClinicalTrialsService.searchFilter(filterName, aggregator, value, optionName, true);
		expect(ClinicalTrialsService.isActiveFilter).toHaveBeenCalledWith(aggregator, value);

		var numFilters = ClinicalTrialsService.getFilters().length;
		expect(numFilters).toEqual(1);
		expect(ClinicalTrialsService.fullTextSearch).toHaveBeenCalled();
	});

	it('should be able to turn off an active filter when toggling a filter', function () {
		ClinicalTrialsService.filters = [];
		var filterName = 'Phase';
		var aggregator = '_summary.phase.value';
		var value = '1';
		var optionName = 'Phase 1';
		var f = {};
		f.or = [];

		var fil = { 'terms': {
				'_summary.phase.value': ['1']
			}
		};

		f.or.push(fil);

		ClinicalTrialsService.filters.push(f);

		spyOn(ClinicalTrialsService, 'isActiveFilter').and.callThrough();
		ClinicalTrialsService.searchFilter(filterName, aggregator, value, optionName);
		expect(ClinicalTrialsService.isActiveFilter).toHaveBeenCalledWith(aggregator, value);

		var numFilters = ClinicalTrialsService.getFilters().length;
		expect(numFilters).toEqual(0);
	});

	it('should retrieve a list of filters excluded with an argumented aggregator. ', function() {
		var aggregators = ClinicalTrialsMocks.getSearchAggregators();
		var agg = aggregators.gene;
		var aggField = agg.terms.field;

		var filters = ClinicalTrialsMocks.getSearchFilters();
		ClinicalTrialsService.setFilters(filters);

		var excludedFilters = ClinicalTrialsService.getFiltersExcludedWith(aggField);
		var expectedFilters = ClinicalTrialsMocks.getFiltersExcludedWithHugoSymbol();
		expect(excludedFilters).toEqual(expectedFilters);
	});

	it('should return when no highlighting is available in the trial', function() {
		var trial = {};
		trial.protocol_no = '12-123';
		var ret = ClinicalTrialsService.getHighlightContext(trial);
		expect(ret).toEqual(false);
	});

	it('should be able to fetch a trial coordinator for a trial', function() {
		var trials = ClinicalTrialsMocks.mockClinicalTrials();
		var trial = trials[0];

		// Remove Lead study coordinator
		trial.staff_list.protocol_staff.shift();

		var sc = ClinicalTrialsService.getTrialCoordinator(trial);

		scope.$digest();
	});

	it('should be able to setup and initiate a coordinator email', function (){
		var evt = jasmine.createSpyObj('e', ['stopPropagation']);
		var trials = ClinicalTrialsMocks.mockClinicalTrials();
		var trial = trials[0];

		spyOn($window, 'open');

		var email = trial.staff_list.protocol_staff[0];
		var opts = {
			subject: TEMPLATES.clinical_trial.contact_coordinator_subject + ' ' + trial.protocol_no,
			body: TEMPLATES.clinical_trial.contact_coordinator_body
		};

		ClinicalTrialsService.emailCoordinator(evt, trial, email);

		expect($window.open).toHaveBeenCalledWith(Mailto.url(email, opts), "_self");
	});

	// describe('context highlighting', function() {
	// 	var trial;
	//
	// 	beforeEach(function(){
	// 		var trials = ClinicalTrialsMocks.mockClinicalTrials();
	// 		trial = trials[0];
	// 	});
	//
	// 	it('should be able to generate a prioritized highlight context', function() {
	// 		var priorityContext = ClinicalTrialsMocks.getPriorityContext();
	// 		var extTrial = _.extend(trial, priorityContext);
	// 		var highlight = ClinicalTrialsService.getHighlightContext(extTrial);
	//
	// 		expect(highlight).toEqual('<ul>' + priorityContext.highlight.nct_purpose[0] + '</ul>');
	// 	});
	//
	// 	it('should be able to generate a highlight context when preferred context is missing', function() {
	// 		var noPriorityContext = ClinicalTrialsMocks.getNoPriorityContext();
	// 		var extTrial = _.extend(trial, noPriorityContext);
	// 		var highlight = ClinicalTrialsService.getHighlightContext(extTrial);
	// 		var expectedContextValue = noPriorityContext.highlight.protocol_id[0];
	// 		var listedContext = "<ul><li><i>Protocol id</i>: " +expectedContextValue+ "</li></ul>";
	//
	// 		expect(highlight).toEqual(listedContext);
	// 	});
	// });

	// describe('Clinical trial detail specific methods', function(){
	// 	var trial;
	//
	// 	beforeEach(function(){
	// 		var trials = ClinicalTrialsMocks.mockClinicalTrials();
	// 		trial = trials[0];
	// 	});
	//
	// 	it('should retrieve a sorted retrieve a sorted list of steps', function(done){
	// 		ClinicalTrialsService.getSortedTreatmentStepList(trial).then(function(res) {
	// 			expect(res).toEqual(trial.treatment_list.step);
	// 			done();
	// 		});
	//
	// 		scope.$digest();
	// 	});
	//
	// 	it('should return undefined when invalid arguments are given to getVariantsFromTreatmentStepList', function() {
	// 		// Rejected without arguments
	// 		spyOn(ClinicalTrialsService, 'getVariantsFromTreatmentStepList').and.callThrough();
	//
	// 		var noArgPromise = ClinicalTrialsService.getVariantsFromTreatmentStepList();
	// 		noArgPromise.catch( function(res) {
	// 			expect(res).toEqual('No trial or treatment list available to parse.');
	// 		});
	//
	// 		scope.$digest();
	// 	});
	//
	// 	it('should return undefined when no treatment list is present', function() {
	// 		// Without the treatment_list
	// 		delete trial.treatment_list;
	//
	// 		spyOn(ClinicalTrialsService, 'getVariantsFromTreatmentStepList').and.callThrough();
	//
	// 		var noTreatmentListPromise = ClinicalTrialsService.getVariantsFromTreatmentStepList(trial);
	// 		noTreatmentListPromise.catch( function(res) {
	// 			expect(res).toEqual('No trial or treatment list available to parse.');
	// 		});
	//
	// 		scope.$digest();
	// 	});
	//
	// 	it('should be able to recursively generate the genomic alteration list from a trial', function() {
	// 		spyOn(ClinicalTrialsService, 'getVariantsFromTreatmentStepList').and.callThrough();
	//
	// 		var uniqVariantsPromise = ClinicalTrialsService.getVariantsFromTreatmentStepList(trial);
	// 		uniqVariantsPromise.then( function(res) {
	// 			var expectedAlterations = ClinicalTrialsMocks.mockVariants();
	// 			console.log(res)
	// 			expect(res).toEqual(expectedAlterations);
	// 		});
	//
	// 		scope.$digest();
	// 	});
	//
	// });

	describe('The functionality of the facetOptionsState management', function (){
		it('should be able to set the facetOptionsState', function() {
			var facetOptions = ClinicalTrialsMocks.getFacetOptionsState();
			ClinicalTrialsService.setFacetOptionsState(facetOptions);

			expect(ClinicalTrialsService.facetOptionsState).toEqual(facetOptions);
		});

		it('should be able to get the facetOptionsState when empty', function() {
			expect(ClinicalTrialsService.getFacetOptionsState()).toEqual({});
		});

		it('should be able to get the facetOptionsState when set', function() {
			var facetOptions = ClinicalTrialsMocks.getFacetOptionsState();
			ClinicalTrialsService.setFacetOptionsState(facetOptions);

			expect(ClinicalTrialsService.getFacetOptionsState()).toEqual(facetOptions);
		});

		it('should be able to clear the facetOptionsState when set', function() {
			var facetOptions = ClinicalTrialsMocks.getFacetOptionsState();
			ClinicalTrialsService.setFacetOptionsState(facetOptions);
			ClinicalTrialsService.clearFacetOptionsState();
			expect(ClinicalTrialsService.getFacetOptionsState()).toEqual({});
		});
	});

});


