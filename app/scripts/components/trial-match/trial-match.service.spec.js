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

describe('Trial Match Service Unit Tests', function () {
	// Setup
	var TrialMatchService,
		TrialMatchREST,
		mrn,
		vital_status,
		trial_curation_level_status,
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
			vital_status = 'alive';
			trial_curation_level_status = 'open';
			sample_id = 'BRCA-METABRIC-S2-MB-0245';
			sort = 'sort_order';
			$rootScope = _$rootScope_;
		})
	);

	it('should able to fetch trial matches by MRN, vital status, trial_curation_level_status and sample id', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(mrn, vital_status, trial_curation_level_status, sample_id);

		var q = {
			where: {
				mrn: mrn,
				vital_status: vital_status,
				trial_curation_level_status: trial_curation_level_status,
				sample_id: sample_id
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN, vital status and trial curation level status', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(mrn, vital_status, trial_curation_level_status);

		var q = {
			where: {
				mrn: mrn,
				vital_status: vital_status,
				trial_curation_level_status: trial_curation_level_status
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN and vital status', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(mrn, vital_status);

		var q = {
			where: {
				mrn: mrn,
				vital_status: vital_status
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});

	it('should able to fetch trial matches by MRN', function () {
		spyOn(TrialMatchREST, 'query').and.returnValue({});

		TrialMatchService.getTrialMatchesForPatient(mrn);

		var q = {
			where: {
				mrn: mrn
			}
		};

		expect(TrialMatchREST.query).toHaveBeenCalledWith(q);
	});
});

