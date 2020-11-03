'use strict';

describe('Controller: ClinicalTrialsCtrl', function () {
	var ctrl,
		scope,
		rootScope,
		ElasticSearchService,
		ClinicalTrialsService,
		ClinicalTrialsMocks,
		Principal;


	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		Principal = jasmine.createSpyObj('Principal', [
			'isAuthenticated'
		]);

		module(function($provide) {
			$provide.value('Principal', Principal);
		});

		inject(function ($controller, $rootScope, _ElasticSearchService_, _ClinicalTrialsService_, _ClinicalTrialsMocks_) {
			scope = $rootScope.$new();
			rootScope = $rootScope;
			ElasticSearchService = _ElasticSearchService_;
			ClinicalTrialsService = _ClinicalTrialsService_;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;

			Principal.isAuthenticated.and.returnValue(true);

			ctrl = $controller('ClinicalTrialsCtrl', {
				$scope: scope
			});

		});
	});

	it('should be set the isAuthenticated parameter on init', function () {
		expect(ctrl.isAuthenticated).toBe(true);
	});

	it('should be able to detect changes of the searchterm in the elasticsearchservice and update the metadata', function () {
		expect(ctrl.searchTerm).toBe('');
		ElasticSearchService.setSearchTerm('test term');
		ClinicalTrialsService.clinicalTrialsList = [];
		scope.$digest();
		expect(ctrl.searchTerm).toBe('test term');
		expect(ctrl.metadata).toBeDefined();
		expect(ctrl.metadata.total_elements).toBe(0);
		expect(ctrl.metadata.current_page).toBe(1);
	});

	it('should be able to detect changes of the  loading indicator used in the clinicaltrialsservice', function () {
		expect(ctrl.isLoading).toBeUndefined();
		ClinicalTrialsService.clinicalTrialsList = [];
		ClinicalTrialsService.isLoading = true;

		scope.$digest();
		expect(ctrl.isLoading).toBeTruthy();
	});

	it('should be able to detect changes of the clinical trials list in the service', function () {
		ClinicalTrialsService.clinicalTrialsList = [];
		expect(ctrl.numResults).toBe(0);

		ClinicalTrialsService.clinicalTrialsList = ClinicalTrialsMocks.mockClinicalTrials();
		scope.$digest();

		expect(ctrl.numResults).toBe(1);
	});

});
