'use strict';

describe('Trial Match Service Unit Tests', function () {
	// Setup
	var TrialMatchService,
		TrialMatchREST,
		mrn,
		clinical_id,
		vital_status,
		trial_curation_level_status,
		show_in_ui,
		trial_summary_status,
		is_disabled,
		sample_id,
		sort,
		$rootScope;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(
		inject(function (_TrialMatchService_, _TrialMatchREST_, _$rootScope_) {
			TrialMatchService = _TrialMatchService_;
			TrialMatchREST = _TrialMatchREST_;
			mrn = 'TCGA-11A-3D4C';
			clinical_id = "123id";
			vital_status = 'alive';
			trial_curation_level_status = 'open';
			trial_summary_status = 'open';
			is_disabled = false;
			show_in_ui = true;
			sample_id = 'BRCA-METABRIC-S2-MB-0245';
			sort = 'sort_order';
			$rootScope = _$rootScope_;
		})
	);

	it('should able to fetch trial matches by MRN, vital status, trial_curation_level_status and sample id', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(clinical_id, vital_status, trial_curation_level_status);

		var q = {
			where: {
				clinical_id: clinical_id,
				vital_status: vital_status,
				trial_curation_level_status: trial_curation_level_status,
				trial_summary_status: trial_summary_status,
				show_in_ui: show_in_ui,
				is_disabled: is_disabled
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN, vital status and trial curation level status', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(clinical_id, vital_status, trial_curation_level_status);

		var q = {
			where: {
				clinical_id: clinical_id,
				vital_status: vital_status,
				trial_curation_level_status: trial_curation_level_status,
				trial_summary_status: trial_summary_status,
				show_in_ui: show_in_ui,
				is_disabled: is_disabled
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN and vital status', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(clinical_id, vital_status);

		var q = {
			where: {
				clinical_id: clinical_id,
				vital_status: vital_status,
				show_in_ui: show_in_ui,
				is_disabled: is_disabled
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(clinical_id);

		var q = {
			where: {
				clinical_id: clinical_id,
				show_in_ui: show_in_ui,
				is_disabled: is_disabled
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});
});

