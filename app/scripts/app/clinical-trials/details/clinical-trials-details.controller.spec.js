'use strict';

describe('Controller: ClinicalTrialsFiltersCtrl', function () {
	var ctrl,
		scope,
		state,
		rootScope,
		mockTrial,
		ClinicalTrialsService,
		ctTrialPromise,
		ctVariantsFromTreatmentListPromise,
		ctTreatmentListPromise,
		ctStudyCoordinatorPromise,
		ClinicalTrialsMocks,
		$q,
		$timeout,
		$log,
		$window,
		ENV,
		TEMPLATES,
		Mailto;

	// Initialize the controller and a mock scope
	beforeEach(function () {

		// load the controller's module
		module('matchminerUiApp');

		ClinicalTrialsService = jasmine.createSpyObj('ClinicalTrialsService', [
			'getTrial',
			'setTrial',
			'getVariantsFromTreatmentStepList',
			'getSortedTreatmentStepList',
			'getTrialCoordinator',
			'emailCoordinator'
		]);

		module(function($provide) {
			$provide.value('ClinicalTrialsService', ClinicalTrialsService);
		});


		inject(function ($controller, $rootScope, _ElasticSearchService_, _ClinicalTrialsService_, _ClinicalTrialsMocks_, _ElasticSearchMocks_, _$state_, _$q_, _$timeout_, _$log_, _$window_, _ENV_, _TEMPLATES_, _Mailto_) {
			scope = $rootScope.$new();
			state = _$state_;
			rootScope = $rootScope;
			ClinicalTrialsMocks = _ClinicalTrialsMocks_;
			mockTrial = ClinicalTrialsMocks.mockClinicalTrials()[0];
			$q = _$q_;
			$timeout = _$timeout_;
			$log = _$log_;
			ENV = _ENV_;
			Mailto = _Mailto_;
			TEMPLATES = _TEMPLATES_;
			$window = _$window_;

			/**
			 * Setup promises
			 */
			ctTrialPromise = $q.defer();
			ctVariantsFromTreatmentListPromise = $q.defer();
			ctTreatmentListPromise = $q.defer();
			ctStudyCoordinatorPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			ClinicalTrialsService.getTrial.and.returnValue( ctTrialPromise.promise );
			ClinicalTrialsService.getVariantsFromTreatmentStepList.and.returnValue(ctVariantsFromTreatmentListPromise.promise );
			ClinicalTrialsService.getSortedTreatmentStepList.and.returnValue( ctTreatmentListPromise.promise );
			ClinicalTrialsService.emailCoordinator.and.returnValue(true);
			ClinicalTrialsService.getTrialCoordinator.and.returnValue(true);

			ctrl = $controller('ClinicalTrialsDetailsCtrl', {
				$scope: scope
			});

		});
	});

	it('should be able to load a clinical trial', function() {
		var protocol_no = '12-345';

		spyOn(ctrl, 'getTrialCoordinator').and.returnValue( ctStudyCoordinatorPromise.promise );

		expect(ctrl.isLoading).toBeTruthy();

		// Fetch the trial
		ctrl.loadClinicalTrial(protocol_no);

		// Resolve trial
		ctTrialPromise.resolve({
			_items: [ mockTrial ]
		});

		// Digest the cycle
		scope.$digest();

		// Resolve the promises
		ctVariantsFromTreatmentListPromise.resolve(ClinicalTrialsMocks.mockVariants());
		ctTreatmentListPromise.resolve(mockTrial.treatment_list.step);
		ctStudyCoordinatorPromise.resolve(mockTrial.staff_list.protocol_staff[0]);

		// Digest another cycle
		scope.$digest();

		// Expectations
		expect(ctrl.variants).toEqual(ClinicalTrialsMocks.mockVariants());
		expect(ctrl.studyCoordinator).toEqual(mockTrial.staff_list.protocol_staff[0]);
		expect(ctrl.treatment_steps).toEqual(mockTrial.treatment_list.step);

		// Test finally block
		scope.$digest();
		expect(ctrl.trial).toEqual(mockTrial);
	});

	it('should be able to gracefully fail parsing a clinical trial', function() {
		var protocol_no = '12-345';

		// Fetch the trial
		ctrl.loadClinicalTrial(protocol_no);

		spyOn(ctrl, '_handleTrialParseError').and.callThrough();
		spyOn($log, 'error');

		// Resolve trial
		ctTrialPromise.resolve({
			_items: [ mockTrial ]
		});

		ctVariantsFromTreatmentListPromise.reject("parsing the trial");
		scope.$digest();
		expect(ctrl._handleTrialParseError).toHaveBeenCalledWith("parsing the trial");
		expect($log.error).toHaveBeenCalledWith("An error occurred while ", "parsing the trial")
	});

	it('should be able to gracefully fail retrieving undefined for a clinical trial', function() {
		var protocol_no = '12-345';

		// Fetch the trial
		ctrl.loadClinicalTrial(protocol_no);

		// Resolve trial
		ctTrialPromise.resolve({
			_items: [undefined]
		});

		scope.$digest();
		expect(ctrl.trialNotFound).toBeTruthy();
		expect(ctrl.isLoading).toBeFalsy();
	});

	it('should be able to fetch a study coordinator when there is no Lead Study Coordinator', function() {
		ctrl.getTrialCoordinator(mockTrial);
		expect(ClinicalTrialsService.getTrialCoordinator).toHaveBeenCalledWith(mockTrial);
	});

	it('should be able to open a link to CTgov', function() {
		var nct_id = '12-345';

		spyOn(window, 'open');
		var path = ENV.resources.ctgov_base + nct_id;
		ctrl.visitCTgov(nct_id);

		expect(window.open).toHaveBeenCalledWith(path, '_blank');
	});

	it('should be able to open a link to OncoPro', function() {
		var protocol_no = '12-345';

		spyOn(window, 'open');
		var path = ENV.resources.oncpro_base + protocol_no;
		ctrl.visitOncoPro(protocol_no);

		expect(window.open).toHaveBeenCalledWith(path, '_blank');
	});

	it('should be able to email an investigator', function() {
		var evt = jasmine.createSpyObj('e', ['stopPropagation', 'preventDefault']);
		var email = mockTrial.staff_list.protocol_staff[0];

		ctrl.emailInvestigator(evt, mockTrial, email);

		expect(ClinicalTrialsService.emailCoordinator).toHaveBeenCalledWith(evt, mockTrial, email);
	});

	it('should be able to resolve the correct status CSS for the detail badge', function() {
		var cssObj = ctrl.getStatusCss(mockTrial);
		expect(cssObj).toEqual(ClinicalTrialsMocks.mockStatusCssForTrial());
	});

	it('should be able to resolve the correct icon for different trials', function() {
		var statusses = ['Open to Accrual', 'New', 'On Hold', 'SRC Approval', 'Closed to Accrual', 'IRB Study Closure'];
		var expectedIcons = ['check', 'pause_circle_outline', 'pause_circle_outline', 'pause_circle_outline', 'warning', 'stop'];
		_.each(statusses, function(elm, idx) {
			var icon = ctrl.getIconForTrialStatus(elm);
			expect(icon).toEqual(expectedIcons[idx]);
		});
	});


});
