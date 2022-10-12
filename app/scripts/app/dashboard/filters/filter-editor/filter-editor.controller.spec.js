'use strict';

/*
 * Cases to test:
 * - Validity of filters (Always label, description, TRUE_HUGO_SYMBOL and a VARIANT_CATEGORY on unsanitized objects
 * - Object sanitisation to make the filter object compatible with the API and vice versa.
 * -
 */

describe('Controller: FilterEditorCtrl', function () {

	var ctrl,
		FiltersREST,
		FiltersPromise,
		UtilitiesService,
		FiltersMocks,
		UserAccountMocks,
		ToastService,
		GraphService,
		$location,
		$state,
		$timeout,
		$httpBackend,
		$q,
		mdDialog,
		scope,
		rootScope,
		ENV,
		Options,
		AutocompleteService,
		AutocompletePromise,
		AutocompleteMocks,
		MatchminerApiSanitizer;

	// Initialize the controller and a mock scope
	beforeEach(function() {

		// load the controller's module
		module('matchminerUiApp');

		AutocompleteService = jasmine.createSpyObj('AutocompleteService', [
			'queryAutocomplete'
		]);

		FiltersREST = jasmine.createSpyObj('FiltersREST', [
			'saveGenomicFilter',
			'updateGenomicFilter'
		]);

		module(function($provide) {
			$provide.value('AutocompleteService', AutocompleteService);
			$provide.value('FiltersREST', FiltersREST);
		});

		inject(function ($controller, $rootScope, $injector, _FiltersREST_, _$q_, _ToastService_, _$location_, _$timeout_, _UtilitiesService_, _UserAccountMocks_, _Options_, _$state_, _FiltersMocks_, _AutocompleteMocks_, _$mdDialog_, _GraphService_) {
			scope = $rootScope.$new();
			rootScope = $rootScope;
			$q = _$q_;
			$httpBackend = $injector.get('$httpBackend');
			$location = _$location_;
			$timeout = _$timeout_;
			$state = _$state_;

			Options = _Options_;
			FiltersMocks = _FiltersMocks_;
			UtilitiesService = _UtilitiesService_;
			GraphService = _GraphService_;
			MatchminerApiSanitizer = $injector.get('MatchminerApiSanitizer');
			UserAccountMocks = _UserAccountMocks_;
			AutocompleteMocks = _AutocompleteMocks_;
			mdDialog = _$mdDialog_;

			var ctiUser = UserAccountMocks.mockCtiAccount();

			ToastService = _ToastService_;
			ENV = $injector.get('ENV');

			/**
			 * Setup promise
			 */
			AutocompletePromise = $q.defer();
			AutocompleteService.queryAutocomplete.and.returnValue({ $promise: AutocompletePromise.promise });

			FiltersPromise = $q.defer();
			FiltersREST.saveGenomicFilter.and.returnValue({ $promise: FiltersPromise.promise });
			FiltersREST.updateGenomicFilter.and.returnValue({ $promise: FiltersPromise.promise });

			ctrl = $controller('FilterEditorCtrl', {
				$scope: scope,
				'FiltersREST': FiltersREST,
				'UserAccount': ctiUser,
				$routeParams: {}
			});

			ctrl.geneSymbols = [
				'ABL1',
				'EGFR',
				'CTNNB1',
				'P53',
				'CTNNA2'
			];

			ctrl.geneSymbols = _.sortBy(ctrl.geneSymbols, function(gene) {return gene });

			spyOn(ctrl, 'loadAllGenes');
			var r = new RegExp(ENV.api.endpoint +'\/utility\/unique.*');
			$httpBackend.whenGET(r).respond(ctrl.geneSymbols);
		});
	});

	it('to have 4 cancer types to select from', function() {
		expect(Object.keys(ctrl.cancerTypes).length).toEqual(4);
	});

	it('to have 3 gender options to select from', function() {
		expect(Object.keys(ctrl.genders).length).toEqual(3);
	});

	it('to have 5 genomic alteration options to select from', function() {
		expect(Object.keys(ctrl.genomicAlterations).length).toEqual(5);
	});

	it('to hold the default filter data properties set', function() {
		var d = ctrl.data;
		expect(ctrl.data.selectedGene).toEqual([]);
		expect(ctrl.data.reportDate.prefix).toEqual('all');
		expect(ctrl.data.ageRange.prefix).toEqual('all');
	});

	it('to have access to the underscore library', function() {
		expect(_.size(ctrl.genders)).toEqual(3);
	});

	/*
	 * Basic filter validity
	 * Clearform() is already called by reinitializing the controller.
	 */
	it('to be able to validate a valid basic filter', function() {
		// Setup a valid filter
		var f = ctrl.filter;
		f.label = 'test filter';
		f.protocol_id = ENV.resources.institution + ' protocol ID';

		f.genomic_filter.TRUE_HUGO_SYMBOL = ['ABL1'];
		var validation = ctrl.isValidFilter(f);

		expect(validation).toBeTruthy();
	});

	it('to be able to validate a valid clinical age filter', function() {
		// Setup a valid filter
		var f = ctrl.filter;
		f.label = 'test filter';
		f.protocol_id = ENV.resources.institution + ' protocol ID';

		f.genomic_filter.TRUE_HUGO_SYMBOL = ['ABL1'];
		f.clinical_filter.AGE_NUMERICAL = {};
		var d = new Date();
		d.setFullYear(d.getFullYear()-1);
		f.clinical_filter.AGE_NUMERICAL['^lte'] = d;

		expect(ctrl.isValidFilter(f)).toBeTruthy();
	});

	it('to be able to detect an invalid filter', function() {
		// Setup a invalid filter
		var f = ctrl.filter;
		f.label = 'test filter';
		f.protocol_id = ENV.resources.institution + ' protocol ID';

		f.genomic_filter.TRUE_HUGO_SYMBOL = [];
		f.genomic_filter.VARIANT_CATEGORY = {};

		expect(ctrl.isValidFilter(f)).toBeFalsy();
	});

	/*
	 * Filter API sanitization
	 */

	it('to set the team and user id\'s when account is set', function() {
		expect(ctrl._teamId).toEqual('577cf6ef2b9920002e041cb3');
		expect(ctrl._userId).toEqual('577cf6ef2b9920002cef0337');
	});

	it('should set a TRUE_HUGO_SYMBOL after selection from the dropdown and recalculate the intermediate filter.', function(){
		var gene = 'ABL1';
		ctrl.clearForm();

		spyOn(ctrl, 'preloadTranscriptExonForGene');
		spyOn(ctrl, 'preloadProteinChangesForGene');
		spyOn(ctrl, 'fetchIntermediateFilterResults');

		ctrl._geneAutocompleteChange(gene);
		// Expect filter label to be set to gene symbol.
		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL.length).toBe(1);
		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL[0]).toEqual(gene);
		expect(ctrl.preloadTranscriptExonForGene).toHaveBeenCalledWith(gene);
		expect(ctrl.preloadProteinChangesForGene).toHaveBeenCalledWith(gene);
	});

	it('should add a second TRUE_HUGO_SYMBOL to the array and recalculate the intermediate filter', function() {
		var gene = 'EGFR';
		ctrl.clearForm();

		ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL = ['ABL1'];

		spyOn(ctrl, 'preloadTranscriptExonForGene');
		spyOn(ctrl, 'preloadProteinChangesForGene');
		spyOn(ctrl, 'fetchIntermediateFilterResults');

		ctrl._geneAutocompleteChange(gene);

		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL.length).toBe(2);
		expect(ctrl.preloadProteinChangesForGene).not.toHaveBeenCalled();
		expect(ctrl.preloadTranscriptExonForGene).not.toHaveBeenCalled();
	});

	it('to remove a give TRUE_HUGO_SYMBOL from the array given its present.', function() {
		var gene = 'ABL1';
		ctrl.clearForm();
		ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL = ['ABL1'];
		spyOn(ctrl, 'fetchIntermediateFilterResults');

		ctrl.removeGene(gene);
		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL.length).toBe(0);
	});

	it('to remove a give TRUE_HUGO_SYMBOL from the array given its NOT present.', function() {
		var gene = 'ABL1';
		ctrl.clearForm();
		ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL = [];
		spyOn(ctrl, 'fetchIntermediateFilterResults');

		ctrl.removeGene(gene);
		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL.length).toBe(0);
	});

	it('to sanitize and save a genomic filter', function() {
		var filter = FiltersMocks.mockFilters()._items[2];
		expect(ctrl.isProcessingBusy).toBe(undefined);

		// Init default filter model.
		ctrl.clearForm();

		// Set spies
		spyOn(MatchminerApiSanitizer, 'transformGenomicFilter').and.callFake( function() {
			return filter;
		});

		spyOn(ToastService, 'success').and.callFake(function(input) {
			var deferred = $q.defer();
			deferred.resolve('Resolved success');
			return deferred.promise;
		});

		spyOn($state, 'go');

		var r = new RegExp(ENV.api.endpoint +'\/utility\/unique.*');
		$httpBackend.whenGET(r).respond({"Test": 'object'});
		var ru = new RegExp(ENV.api.endpoint +'\/user.*');
		$httpBackend.whenGET(ru).respond({"test": 'object'});

		// Bogus data which has to be cleared when set
		rootScope.tableFilter = {};
		rootScope.tableFilter.date = "12-34-56";
		rootScope.tableFilter.filter = {
			'_id': '1234567890'
		};

		rootScope.matchQuery = {};
		rootScope.matchQuery.FILTER_ID = "1234567890";
		rootScope.tableFilter.REPORT_DATE = new Date();


		expect(ctrl.isProcessingBusy).toBe(undefined);

		var res = {
			_id: 'Saved filter-01',
			num_samples: 15
		};

		ctrl.saveFilter(filter);

		expect(MatchminerApiSanitizer.transformGenomicFilter).toHaveBeenCalledWith(filter, true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);
		expect(FiltersREST.saveGenomicFilter).toHaveBeenCalledWith(filter);

		FiltersPromise.resolve(res);
		// Tell angular to process all the async calls first and resolve the callbacks.
		scope.$digest();

		expect(rootScope.tableFilter.date).toBeUndefined();
		expect(rootScope.tableFilter.filter).toBeUndefined();

		expect(rootScope.matchQuery.FILTER_ID).toBeUndefined();
		expect(rootScope.matchQuery.REPORT_DATE).toBeUndefined();

		expect(ToastService.success).toHaveBeenCalledWith("Save success. 15 matches were marked as 'Pending'.");

		// Flush timeout function before checking for the redirect.
		$timeout.flush();
		expect(ctrl.isProcessingBusy).toBe(false);
		expect($state.go).toHaveBeenCalledWith('filters-overview');
	});

	it('to catch an error while saving a filter.', function(){
		var filter = FiltersMocks.mockFilters()._items[1];
		ctrl.clearForm();

		// Set spies
		spyOn(MatchminerApiSanitizer, 'transformGenomicFilter').and.callFake( function() {
			return filter;
		});

		spyOn(ToastService, 'warn').and.callFake(function(input) {
			var deferred = $q.defer();
			deferred.resolve('Resolved warning message');
			return deferred.promise;
		});

		var r = new RegExp(ENV.api.endpoint +'\/utility\/unique.*');
		$httpBackend.whenGET(r).respond({"Test": 'object'});

		ctrl.saveFilter(filter);

		expect(MatchminerApiSanitizer.transformGenomicFilter).toHaveBeenCalledWith(filter, true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);
		expect(FiltersREST.saveGenomicFilter).toHaveBeenCalledWith(filter);

		var err = 'An error occurred while saving the filter';
		FiltersPromise.reject(err);
		scope.$digest();

		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect(ToastService.warn).toHaveBeenCalledWith("An error occurred while saving the filter");
	});

	it('to sanitize and update a genomic filter', function() {
		var filter = FiltersMocks.mockFilters()._items[1];
		spyOn($state, 'go');
		var ru = new RegExp(ENV.api.endpoint +'\/user.*');
		$httpBackend.whenGET(ru).respond({"test": 'object'});

		// Set spies
		spyOn(MatchminerApiSanitizer, 'transformGenomicFilter').and.callFake( function() {
			return filter;
		});

		spyOn(MatchminerApiSanitizer, 'sanitizeEveResource').and.callFake( function() {
			return filter;
		});

		// Bogus data which has to be cleared when set
		rootScope.tableFilter = {};
		rootScope.tableFilter.date = "12-34-56";
		rootScope.tableFilter.filter = {
			'_id': '1234567890'
		};

		var res = {
			_id: 'Updated filter-01',
			num_samples: 15
		};

		rootScope.matchQuery = {};
		rootScope.matchQuery.FILTER_ID = "1234567890";
		rootScope.tableFilter.REPORT_DATE = new Date();

		ctrl.updateGenomicFilter(filter);
		expect(ctrl.isProcessingBusy).toBeTruthy();

		expect(MatchminerApiSanitizer.transformGenomicFilter).toHaveBeenCalledWith(filter, true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);
		expect(MatchminerApiSanitizer.sanitizeEveResource).toHaveBeenCalledWith(filter, {}, true);
		expect(FiltersREST.updateGenomicFilter).toHaveBeenCalledWith(filter);

		FiltersPromise.resolve(res);
		// Tell angular to process all the async calls first and resolve the callbacks.
		scope.$digest();

		expect(rootScope.tableFilter.date).toBeUndefined();
		expect(rootScope.tableFilter.filter).toBeUndefined();

		expect(rootScope.matchQuery.FILTER_ID).toBeUndefined();
		expect(rootScope.matchQuery.REPORT_DATE).toBeUndefined();

		// Flush timeout function before checking for the redirect.
		$timeout.flush();
		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect($state.go).toHaveBeenCalledWith('filters-overview');
	});

	it('to catch an error while updating a filter.', function(){
		var filter = FiltersMocks.mockFilters()._items[0];
		spyOn(ToastService, 'warn').and.callFake(function(input) {
			var deferred = $q.defer();
			deferred.resolve('Warning success');
			return deferred.promise;
		});

		// Set spies
		spyOn(MatchminerApiSanitizer, 'transformGenomicFilter').and.callFake( function() {
			return filter;
		});

		ctrl.updateGenomicFilter(filter);
		expect(MatchminerApiSanitizer.transformGenomicFilter).toHaveBeenCalledWith(filter, true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);
		expect(FiltersREST.updateGenomicFilter).toHaveBeenCalledWith(filter);

		FiltersPromise.reject();
		scope.$digest();

		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect(ToastService.warn).toHaveBeenCalledWith('Error updating genomic filter.');
	});

	it('should be able to update the cancer type', function() {
		var selectedCancerType = '_LIQUID_';

		var ct = ctrl.updateCancerType(selectedCancerType);
		expect(ctrl.selectedCancerType).toEqual(selectedCancerType);
		expect(ct).toBe(selectedCancerType);
	});

	it('should return false when fetching an intermediate filter without an argument', function() {
		var ret = ctrl.fetchIntermediateFilterResults(null, true);
		expect(ret).toBeFalsy();
	});

	it('should clear SV genomic alteration selection when saving intermediate filter with a protein change', function() {
		spyOn(ctrl, 'clearCnvSvFromFilter');
		spyOn(ctrl, 'toggleCnvSvAlterationState');

		ctrl.filter.genomic_filter.TRUE_PROTEIN_CHANGE = "p.A1201A";
		ctrl.fetchIntermediateFilterResults(ctrl.filter, false);

		expect(ctrl.clearCnvSvFromFilter).toHaveBeenCalledWith(ctrl.filter);
		expect(ctrl.toggleCnvSvAlterationState).toHaveBeenCalledWith(true);
	});

	it('should clear SV genomic alteration selection when saving intermediate filter with a transcript exon', function() {
		spyOn(ctrl, 'clearCnvSvFromFilter');
		spyOn(ctrl, 'toggleCnvSvAlterationState');

		ctrl.filter.genomic_filter.TRUE_TRANSCRIPT_EXON = "11";
		ctrl.fetchIntermediateFilterResults(ctrl.filter, false);

		expect(ctrl.clearCnvSvFromFilter).toHaveBeenCalledWith(ctrl.filter);
		expect(ctrl.toggleCnvSvAlterationState).toHaveBeenCalledWith(true);
	});

	it('should clear SV genomic alteration selection when saving intermediate filter without a protein change or transcript exon', function() {
		spyOn(ctrl, 'toggleCnvSvAlterationState');

		ctrl.fetchIntermediateFilterResults(ctrl.filter, false);
		expect(ctrl.toggleCnvSvAlterationState).toHaveBeenCalledWith(false);
	});

	it('should return false when trying to save an intermediate filter when its previously busy', function() {
		ctrl.loadingIntermediate = true;
		var ret = ctrl.fetchIntermediateFilterResults(ctrl.filter, false);
		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect(ret).toBeFalsy();
	});

	it('should return false when trying to save an intermediate filter when in a reset refresh cycle', function() {
		var ret = ctrl.fetchIntermediateFilterResults(ctrl.filter, true);
		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect(ret).toBeFalsy();
	});

	it('should return false when trying to save an intermediate filter without genomic and clinical properties', function() {
		delete ctrl.filter.genomic_filter;
		delete ctrl.filter.clinical_filter;

		var ret = ctrl.fetchIntermediateFilterResults(ctrl.filter, false);
		expect(ctrl.isProcessingBusy).toBeFalsy();
		expect(ret).toBeFalsy();
	});

	it('should clear the set transcript exon when saving an intermediate filter with a protein change.', function() {
		ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL = ["EGFR"];
		ctrl.filter.genomic_filter.TRUE_PROTEIN_CHANGE = "p.A1201A";
		ctrl.filter.genomic_filter.TRUE_TRANSCRIPT_EXON = 11;
		ctrl.filter.genomic_filter.VARIANT_CATEGORY = ['MUTATION'];

		spyOn(ctrl, 'checkAndSetCancerType').and.callThrough();
		ctrl.fetchIntermediateFilterResults(ctrl.filter, false);
		expect(ctrl.checkAndSetCancerType).toHaveBeenCalled();

		expect(ctrl.filter.genomic_filter.TRUE_TRANSCRIPT_EXON).toBeUndefined();
	});

	it('should be able to save an intermediate filter', function() {
		ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL = ["EGFR"];
		ctrl.filter.genomic_filter.TRUE_PROTEIN_CHANGE = "p.A1201A";

		spyOn(GraphService, 'hideOrShow');

		ctrl.fetchIntermediateFilterResults(ctrl.filter, false);

		expect(FiltersREST.saveGenomicFilter).toHaveBeenCalled();
		var copy_filter = angular.copy(ctrl.filter);

		var transformed_copy = MatchminerApiSanitizer.transformGenomicFilter(
			copy_filter,
			true,
			['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']
		);

		transformed_copy.enrollment = {
			png: "base64_image_code_enrollment"
		};

		transformed_copy.matches = {
			png: "base64_image_code_matches"
		};

		transformed_copy.status = 2;

//		FiltersPromise.resolve(transformed_copy);
//		scope.$digest();
//
//		expect(GraphService.hideOrShow).toHaveBeenCalled();
//		expect(ctrl.filter.enrollment).toEqual(transformed_copy.enrollment);
//		expect(ctrl.filter.matches).toEqual(transformed_copy.matches);
//
//		expect(ctrl.loadingIntermediate).toBeFalsy();
//		expect(ctrl.isProcessingBusy).toBeFalsy();
	});

	it('should be able to clear the match filters ', function() {
		rootScope.tableFilter = {};
		rootScope.matchQuery = {};

		ctrl.clearMatchFilters();

		expect(rootScope.tableFilter.date).toBeUndefined();
		expect(rootScope.tableFilter.filter).toBeUndefined();

		expect(rootScope.matchQuery.FILTER_ID).toBeUndefined();
		expect(rootScope.matchQuery.REPORT_DATE).toBeUndefined();
	});

	/**
	 * Pre-loaded data tests
	 */
	it('to load the available gene symbols', function(){
		expect(ctrl.filter.genomic_filter.TRUE_HUGO_SYMBOL).toEqual([]);
		var r = new RegExp(ENV.api.endpoint +'\/utility\/unique.*');
		$httpBackend.whenGET(r).respond(ctrl.geneSymbols);

		scope.$digest();

		var sorted = _.sortBy(ctrl.geneSymbols, function(gene) {
			return gene;
		});

		expect(ctrl.geneSymbols).toEqual(sorted);
	});

	it('to be able to query a gene symbol. ', function() {
		var ru = new RegExp(ENV.api.endpoint +'\/user.*');
		$httpBackend.whenGET(ru).respond({"test": 'object'});
		rootScope.$digest();

		// Search for gene symbols containing 'CTN'
		var res = ctrl.queryGeneSearch('CTN');
		var expRes = ['CTNNA2', 'CTNNB1'];

		expect(res).toEqual(expRes);
	});

	it('to be able to query all oncotree data sorted', function() {
		spyOn(UtilitiesService, 'queryUnique').and.returnValue( { $promise: $q.when(FiltersMocks.mockOncotreeDiagnoses()) });

		var loadOTDPromise = ctrl.loadAllOncotreeData();

		loadOTDPromise.then(function(res) {
			var sortedOTD = _.sortBy(res, function(odt) {return odt;});
			expect(ctrl.oncotreeData).toEqual(sortedOTD);
		});
		scope.$digest();
	});

	it('to be able to query a oncotree term', function() {
		var oncotreeDiagnoses = FiltersMocks.mockOncotreeDiagnoses().values;
		ctrl.oncotreeData = _.sortBy(oncotreeDiagnoses, function(otd) {return otd;});
		var q = "Pros";
		var res = ctrl.queryOncotreeData(q);
		expect(res).toEqual([{'text': 'Prostate Cancer'}]);
	});

	// Preload protein changes for gene
	it('should return false when preloadProteinChangesForGene is called without arg', function() {
		var res = ctrl.preloadProteinChangesForGene();
		expect(res).toBeFalsy();
	});

	it('should be able to preload protein changes for a gene', function() {
		var gene = 'ABL1';
		ctrl.preloadProteinChangesForGene(gene);

		// Expect query call on AutocompleteService
		var q = {
			resource: 'genomic',
			field: 'TRUE_PROTEIN_CHANGE',
			value: "",
			gene: gene
		};

		expect(AutocompleteService.queryAutocomplete).toHaveBeenCalledWith(q);

		var proteinChanges = AutocompleteMocks.mockProteinChanges();

		// Resolve autocomplete
		AutocompletePromise.resolve(proteinChanges);

		// Digest promise
		scope.$digest();

		var sortedProteinChanges = _.sortBy(proteinChanges.values, function (ptd) {return ptd});

		expect(ctrl.proteinChangeData).toEqual(sortedProteinChanges);
	});

	// Query valid protein change
	it('should be able to query a protein change by valid search term', function() {
		// Set available protein changes
		var proteinChanges = AutocompleteMocks.mockProteinChanges();
		ctrl.proteinChangeData = _.sortBy(proteinChanges.values, function (ptd) {return ptd});

		var q = 'p.R527';

		var matchingProteinChanges = ctrl.queryProteinChange(q);
		expect(matchingProteinChanges).toEqual(['p.R527W']);
	});

	// Query invalid protein change
	it('should be able to query a protein change by invalid search term', function() {
		// Set available protein changes
		var proteinChanges = AutocompleteMocks.mockProteinChanges();
		ctrl.proteinChangeData = _.sortBy(proteinChanges.values, function (ptd) {return ptd});

		var q = 'x-test-term';

		var matchingProteinChanges = ctrl.queryProteinChange(q);
		expect(matchingProteinChanges).toEqual([]);
	});

	// Query no arg protein change
	it('should return all available protein changes when no argument is given.', function() {
		// Set available protein changes
		var proteinChanges = AutocompleteMocks.mockProteinChanges();
		ctrl.proteinChangeData = _.sortBy(proteinChanges.values, function (ptd) {return ptd});

		var matchingProteinChanges = ctrl.queryProteinChange();
		expect(matchingProteinChanges).toEqual(ctrl.proteinChangeData);
	});

	// Query valid transcript exon
	it('should be able to query a transcript exon by valid search term', function() {
		// Set available transcript exons
		var transcriptExons = AutocompleteMocks.mockTranscriptExons();
		ctrl.transcriptExonData = _.sortBy(transcriptExons.values, function (ted) {return ted});

		var q = '1';

		var matchingTranscriptExons = ctrl.queryTranscriptExon(q);
		expect(matchingTranscriptExons).toEqual([1, 10, 11, 13, 14, 15, 16, 18]);
	});

	// Query invalid transcript exon
	it('should be able to query a transcript exon by invalid search term', function() {
		// Set available protein changes
		var transcriptExons = AutocompleteMocks.mockTranscriptExons();
		ctrl.transcriptExonData = _.sortBy(transcriptExons.values, function (ted) {return ted});

		var q = 'x-test-term';

		var matchingTranscriptExons = ctrl.queryTranscriptExon(q);
		expect(matchingTranscriptExons).toEqual([]);
	});

	// Query no arg transcript exon
	it('should return all available transcript exons when no argument is given.', function() {
		// Set available protein changes
		var transcriptExons = AutocompleteMocks.mockTranscriptExons();
		ctrl.transcriptExonData = _.sortBy(transcriptExons.values, function (ted) {return ted});

		var matchingTranscriptExons = ctrl.queryTranscriptExon();
		expect(matchingTranscriptExons).toEqual(ctrl.transcriptExonData);
	});


	// Preload transcript exons for gene
	it('should return false when preloadTranscriptExonForGene is called without arg', function() {
		var res = ctrl.preloadTranscriptExonForGene();
		expect(res).toBeFalsy();
	});

	it('should be able to preload transcript exons for a gene', function() {
		var gene = 'ABL1';
		ctrl.preloadTranscriptExonForGene(gene);

		// Expect query call on AutocompleteService
		var q = {
			resource: 'genomic',
			field: 'TRUE_TRANSCRIPT_EXON',
			value: "",
			gene: gene
		};

		expect(AutocompleteService.queryAutocomplete).toHaveBeenCalledWith(q);

		var transcriptExons = AutocompleteMocks.mockTranscriptExons();

		// Resolve autocomplete
		AutocompletePromise.resolve(transcriptExons);

		// Digest promise
		scope.$digest();

		var sortedTranscriptExons = _.sortBy(transcriptExons.values, function (ted) {return ted});

		expect(ctrl.transcriptExonData).toEqual(sortedTranscriptExons);
	});

	it('should be able to increment the selected tab index', function() {
		ctrl.selectedTab = 1;
		ctrl.nextTab();
		expect(ctrl.selectedTab).toBe(2);
	});

	it('should be able to decrement the selected tab index', function() {
		ctrl.selectedTab = 1;
		ctrl.previousTab();
		expect(ctrl.selectedTab).toBe(0);
	});

	it('should be able to update a age date field using a specific comparator', function() {
		spyOn(ctrl, 'fetchIntermediateFilterResults');
		// ageRange
		var dataField = 'ageRange';
		var comparator = '$lte';
		var value = 6;
		var d = new Date(Date.now());
		ctrl.updateDateField(dataField, comparator, value);
	});

	it('should be able to update a report date field using a specific comparator', function() {
		spyOn(ctrl, 'fetchIntermediateFilterResults');
		// ageRange
		var dataField = 'reportDate';
		var comparator = '$gte';
		var value = 3;
		ctrl.updateDateField(dataField, comparator, value);

		expect(ctrl.filter.clinical_filter.REPORT_DATE['$gte']).toBe(value);
	});


	it('should be able to reset the report date field using the all comparator.', function() {
		spyOn(ctrl, 'fetchIntermediateFilterResults');
		// ageRange
		var dataField = 'reportDate';
		var comparator = 'all';
		ctrl.updateDateField(dataField, comparator);

		expect(ctrl.filter.clinical_filter.REPORT_DATE).toBe(null);
	});

	it('should be able to reset the birth date field using the all comparator.', function() {
		spyOn(ctrl, 'fetchIntermediateFilterResults');
		// ageRange
		var dataField = 'ageRange';
		var comparator = 'all';
		ctrl.updateDateField(dataField, comparator);

		expect(ctrl.filter.clinical_filter.AGE_NUMERICAL).toBe(null);
	});

	it('should return false when using a specific comparator without a value arg.', function() {
		spyOn(ctrl, 'fetchIntermediateFilterResults');
		// ageRange
		var dataField = 'ageRange';
		var comparator = '$gte';
		var ret = ctrl.updateDateField(dataField, comparator);

		expect(ret).toBeFalsy();
	});

	it('should return false when trying to toggle an alteration selection without an arg.', function() {
		var ret = ctrl.toggleAlterationSelection();
		expect(ret).toBeFalsy();
	});

	it('should return false when trying to toggle an alteration selection that is not available.', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.HA;
		alt.is_available = false;

		var ret = ctrl.toggleAlterationSelection(alt);
		expect(ret).toBeFalsy();
	});

	it('should be able to toggle the alteration selection when absent', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.MUT;
		ctrl.filter.genomic_filter.VARIANT_CATEGORY = [];
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('MUTATION')).toBe(0);
	});

	it('should be able to toggle the alteration selection when present', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.MUT;
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('MUTATION')).toBe(-1);
	});

	it('should be able to toggle the CNV alteration selection when specific CNV_CALL is absent', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.Gain;
		ctrl.filter.genomic_filter.VARIANT_CATEGORY = ['CNV'];
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.CNV_CALL.indexOf('Gain')).toBe(0);
	});

	it('should be able to toggle the CNV alteration selection when absent', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.Gain;
		ctrl.filter.genomic_filter.VARIANT_CATEGORY = [];
		ctrl.filter.genomic_filter.CNV_CALL = undefined;
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('CNV')).toBe(0);
		expect(ctrl.filter.genomic_filter.CNV_CALL.indexOf('Gain')).toBe(0);
	});

	it('should be able to toggle the CNV alteration selection absent and no more CNV_CALLs defined', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.Gain;
		ctrl.filter.genomic_filter.VARIANT_CATEGORY = ['CNV'];
		ctrl.filter.genomic_filter.CNV_CALL = ['Gain'];
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.CNV_CALL.indexOf('Gain')).toBe(-1);
		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('CNV')).toBe(-1);
	});

	it('should be able to toggle the structural variantion alteration selection is absent and inform the user', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.TRL;

		spyOn(mdDialog, 'show').and.callFake( function() {
			return {
				finally: function() {
					var q = $q.defer();

					return q.promise;
				}
			}
		});
		ctrl.toggleAlterationSelection(alt);

		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('SV')).toBe(1); // Should contain 'MUTATION' and 'SV'
		expect(mdDialog.show).toHaveBeenCalled();
	});

	it('should be able to indicate whether the filter has a MUTATION alteration', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.MUT;
		var ret = ctrl.hasAlteration(alt);

		expect(ret).toBeTruthy();
		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('MUTATION')).toBe(0);
	});

	it('should be able to indicate whether the filter has a CNV_CALL alteration', function() {
		var alterations = Options.genomicAlterations;
		var alt = alterations.HA;

		ctrl.filter.genomic_filter.CNV_CALL = [];
		var ret = ctrl.hasAlteration(alt);

		expect(ret).toBeFalsy();
		expect(ctrl.filter.genomic_filter.VARIANT_CATEGORY.indexOf('CNV')).toBe(-1);
		expect(ctrl.filter.genomic_filter.CNV_CALL.indexOf('High level amplification')).toBe(-1);
	});

	// Load existing filter
	it('to be able to load a trial filter', function() {

	});

	it('to go to the filter overview ', function() {
		spyOn($state, 'go');
		ctrl.showFilters();
		expect($state.go).toHaveBeenCalledWith('filters-overview');
	});

	// Initialize a loaded filter
	it('to be able to initialize a loaded filter for SOLID tumours of all patients older than 18', function() {
		var filters = FiltersMocks.mockFilters()._items;
		var f = filters[0];

		ctrl.initLoadedFilter(f);
		expect(ctrl.selectedCancerTypeCategory).toEqual('_SOLID_');
	});

	it('to be able to initialize a loaded filter for Lung Adenocarcinoma tumours of all patients younger than 18', function() {
		var filters = FiltersMocks.mockFilters()._items;
		var f = filters[1];

		spyOn(ctrl, 'queryOncotreeData').and.returnValue(['Lung Add']);

		ctrl.initLoadedFilter(f);
		expect(ctrl.selectedCancerTypeCategory).toEqual('_SPECIFIC_');
		expect(ctrl.selectedCancerType).toEqual('Lung Add');
	});

	it('to be able to initialize a loaded filter for all ages and all report dates', function(){
		var filters = FiltersMocks.mockFilters()._items;
		var f = filters[2];

		spyOn(ctrl, 'queryOncotreeData').and.returnValue(['Lung Add']);

		ctrl.initLoadedFilter(f);
		expect(ctrl.selectedCancerTypeCategory).toEqual('_SPECIFIC_');
		expect(ctrl.selectedCancerType).toEqual('Lung Add');

		expect(ctrl.data.reportDate.prefix).toEqual('all');
		//expect(ctrl.data.reportDate.date).toEqual(new Date());
	});

});
