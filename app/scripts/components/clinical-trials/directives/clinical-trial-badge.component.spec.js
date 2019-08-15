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

describe('Clinical Trials Badge Unit Tests', function () {
	// Setup
	var scope,
		compile,
		$httpBackend,
		ClinicalTrialMocks,
		mockTrials,
		mockTrial,
		drugBadge,
		variantCategoryBadge,
		ageBadge,
		statusBadge,
		phaseBadge,
		tumorTypeBadge,
		stageBadge,
		hugoSymbolBadge;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(function() {
		module('html.templates');
	});

	beforeEach(
		inject(function ($rootScope, $compile, _ClinicalTrialsMocks_, _$httpBackend_) {
			scope = $rootScope.$new();
			$httpBackend = _$httpBackend_;
			compile = $compile;
			ClinicalTrialMocks = _ClinicalTrialsMocks_;
			mockTrials = ClinicalTrialMocks.mockClinicalTrials();
			mockTrial = mockTrials[0];
			scope.mockTrial = mockTrial;
			$httpBackend.whenGET(/^\/api\/user\/.*/).respond(200, {});
		})
	);

	it('should be able to generate an age badge', function() {
		ageBadge = angular.element('<clinical-trial-badge category="age" value="mockTrial.age" view="mockTrial.age"></clinical-trial-badge>');
		ageBadge = compile(ageBadge)(scope);
		scope.$apply();

		var badgeSpan = ageBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Adults');
		expect(badgeSpan.hasClass('ct-badge-age')).toBeTruthy();
	});

	it('should be able to generate a tumor type badge', function() {
		scope.tumor_type_value = mockTrial._summary.tumor_types[0];

		tumorTypeBadge = angular.element('<clinical-trial-badge category="tumor_type" value="tumor_type_value" view="tumor_type_value"></clinical-trial-badge>');
		tumorTypeBadge = compile(tumorTypeBadge)(scope);
		scope.$apply();

		var badgeSpan = tumorTypeBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Non-Seminomatous Germ Cell Tumor');
		expect(badgeSpan.hasClass('ct-badge-tumor-type')).toBeTruthy();
	});

	it('should be able to generate a _SOLID_ tumor type badge with value transformation', function() {
		scope.tumor_type_value = '_SOLID_';

		tumorTypeBadge = angular.element('<clinical-trial-badge category="tumor_type" value="tumor_type_value" view="tumor_type_value"></clinical-trial-badge>');
		tumorTypeBadge = compile(tumorTypeBadge)(scope);
		scope.$apply();

		var badgeSpan = tumorTypeBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('All Solid Tumors');
		expect(badgeSpan.hasClass('ct-badge-tumor-type')).toBeTruthy();
	});

	it('should be able to generate a _SOLID_ tumor type badge with value transformation', function() {
		scope.tumor_type_value = '_LIQUID_';

		tumorTypeBadge = angular.element('<clinical-trial-badge category="tumor_type" value="tumor_type_value" view="tumor_type_value"></clinical-trial-badge>');
		tumorTypeBadge = compile(tumorTypeBadge)(scope);
		scope.$apply();

		var badgeSpan = tumorTypeBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('All Liquid Tumors');
		expect(badgeSpan.hasClass('ct-badge-tumor-type')).toBeTruthy();
	});

	it('should be able to generate a standard gene symbol badge', function() {
		scope.hugo_symbol_value = 'ABL1';

		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('ABL1');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a negating gene symbol badge', function() {
		scope.hugo_symbol_value = '!ABL1';

		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('NO ABL1');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed gene symbol badge', function() {
		scope.hugo_symbol_value = 'RET';
		// High amplification CNV_CALL from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[0].or[1].genomic;

		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('RET (High Amplification)');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a normal High Amplification gene symbol badge', function() {
		// The structural variation will not be displayed in the badge
		scope.hugo_symbol_value = 'RET';
		// Structural Variation variant category from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[0].or[0].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('RET');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed High Amplification gene symbol badge', function() {
		// The structural variation will not be displayed in the badge
		scope.hugo_symbol_value = 'CCND1';
		// Structural Variation variant category from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[6].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('CCND1');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed mutation gene symbol badge with protein change', function() {
		// The structural variation will not be displayed in the badge
		scope.hugo_symbol_value = 'EGFR';
		// Mutation variant category with protein change from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[1].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('EGFR (p.19x71)');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed negating mutation gene symbol badge with protein change', function() {
		scope.hugo_symbol_value = 'EGFR';
		// Protein change and variant category mutation from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[3].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('EGFR (NO p.92J2h8)');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed mutation gene symbol badge with an In Frame Deletion on exon 19', function() {
		scope.hugo_symbol_value = 'ALK';
		// Variation classification category and exon property from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[4].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('ALK (In Frame Del Exon 19)');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed mutation gene symbol badge in exon 19', function() {
		scope.hugo_symbol_value = 'ALK';
		// Mutation variant classification variant category and exon property from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[5].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('ALK (Exon 19)');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed wildtype mutation gene symbol badge', function() {
		scope.hugo_symbol_value = 'KRAS';
		// Mutation variant classification variant category and exon property from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[2].genomic;
		hugoSymbolBadge= angular.element('<clinical-trial-badge category="hugo_symbol" value="hugo_symbol_value" view="hugo_symbol_value" genomic-object="genomicObject"></clinical-trial-badge>');
		hugoSymbolBadge = compile(hugoSymbolBadge)(scope);
		scope.$apply();

		var badgeSpan = hugoSymbolBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('wt KRAS');
		expect(badgeSpan.hasClass('ct-badge-gene-symbol')).toBeTruthy();
	});

	it('should be able to generate a detailed tumor type badge with a ER+/HER2- hormone receptor status', function() {
		scope.oncotree_primary_diagnosis_value = 'Invasive Breast Carcinoma';
		// Clinical object with tumor type and hormone receptor status from the treatment list match criteria
		scope.clinicalObject = mockTrial.treatment_list.step[0].match[0].and[1].or[3].clinical;
		tumorTypeBadge= angular.element('<clinical-trial-badge category="tumor_type" value="oncotree_primary_diagnosis_value" view="oncotree_primary_diagnosis_value" clinical-object="clinicalObject"></clinical-trial-badge>');
		tumorTypeBadge = compile(tumorTypeBadge)(scope);
		scope.$apply();

		var badgeSpan = tumorTypeBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Invasive Breast Carcinoma ER+/HER2-');
		expect(badgeSpan.hasClass('ct-badge-tumor-type')).toBeTruthy();
	});

	it('should be able to generate a detailed tumor type badge with a ER-/PR-/HER2+ hormone receptor status', function() {
		scope.oncotree_primary_diagnosis_value = 'Invasive Breast Carcinoma';
		// Clinical object with tumor type and hormone receptor status from the treatment list match criteria
		scope.clinicalObject = mockTrial.treatment_list.step[0].match[0].and[1].or[4].clinical;
		tumorTypeBadge= angular.element('<clinical-trial-badge category="tumor_type" value="oncotree_primary_diagnosis_value" view="oncotree_primary_diagnosis_value" clinical-object="clinicalObject"></clinical-trial-badge>');
		tumorTypeBadge = compile(tumorTypeBadge)(scope);
		scope.$apply();

		var badgeSpan = tumorTypeBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Invasive Breast Carcinoma ER-/PR-/HER2+');
		expect(badgeSpan.hasClass('ct-badge-tumor-type')).toBeTruthy();
	});

	it('should be able to generate a open to accrual status badge', function() {
		scope.status = 'Open to Accrual';
		statusBadge = angular.element('<clinical-trial-badge category="status" value="status" view="status"></clinical-trial-badge>');
		statusBadge = compile(statusBadge)(scope);
		scope.$apply();

		var badgeSpan = statusBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('OPEN TO ACCRUAL');
		expect(badgeSpan.hasClass('ct-badge-status-green')).toBeTruthy();
	});

	it('should be able to generate a grey status badges', function() {
		var _trialGreyStatusses = ['New', 'On Hold', 'SRC Approval', 'IRB Initial Approval', 'Activation Coordinator Signoff'];

		_.each(_trialGreyStatusses, function (status) {
			scope.status = status;
			statusBadge = angular.element('<clinical-trial-badge category="status" value="status" view="status"></clinical-trial-badge>');
			statusBadge = compile(statusBadge)(scope);
			scope.$apply();

			var badgeSpan = statusBadge.find('span');
			expect(badgeSpan.text().trim()).toEqual(status.toUpperCase());
			expect(badgeSpan.hasClass('ct-badge-status-grey')).toBeTruthy();
		});
	});

	it('should be able to generate a yellow status badges', function() {
		var _trialYellowStatusses = ['Closed to Accrual', 'Suspended'];

		_.each(_trialYellowStatusses, function (status) {
			scope.status = status;
			statusBadge = angular.element('<clinical-trial-badge category="status" value="status" view="status"></clinical-trial-badge>');
			statusBadge = compile(statusBadge)(scope);
			scope.$apply();

			var badgeSpan = statusBadge.find('span');
			expect(badgeSpan.text().trim()).toEqual(status.toUpperCase());
			expect(badgeSpan.hasClass('ct-badge-status-yellow')).toBeTruthy();
		});
	});

	it('should be able to generate a red status badges', function() {
		var _trialRedStatusses = ['IRB Study Closure', 'Terminated'];

		_.each(_trialRedStatusses, function (status) {
			scope.status = status;
			statusBadge = angular.element('<clinical-trial-badge category="status" value="status" view="status"></clinical-trial-badge>');
			statusBadge = compile(statusBadge)(scope);
			scope.$apply();

			var badgeSpan = statusBadge.find('span');
			expect(badgeSpan.text().trim()).toEqual(status.toUpperCase());
			expect(badgeSpan.hasClass('ct-badge-status-red')).toBeTruthy();
		});
	});

	it('should be able to generate a disease status badge', function() {
		scope.stage = mockTrial._summary.disease_status[1];

		stageBadge = angular.element('<clinical-trial-badge category="disease_status" value="stage" view="stage"></clinical-trial-badge>');
		stageBadge = compile(stageBadge)(scope);
		scope.$apply();

		var badgeSpan = stageBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Recurrent');
		expect(badgeSpan.hasClass('ct-badge-stage')).toBeTruthy();
	});

	it('should be able to generate a phase badge', function() {
		scope.phase_value = mockTrial._summary.phase_summary;

		phaseBadge = angular.element('<clinical-trial-badge category="phase" value="phase_value" view="phase_value" prefix="Phase"></clinical-trial-badge>');
		phaseBadge = compile(phaseBadge)(scope);
		scope.$apply();

		var badgeSpan = phaseBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Phase II');
		expect(badgeSpan.hasClass('ct-badge-phase')).toBeTruthy();
	});

	it('should be able to generate a drug badge', function() {
		scope.drug_value = mockTrial._summary.drugs[0];

		drugBadge = angular.element('<clinical-trial-badge category="drug" value="drug_value" view="drug_value"></clinical-trial-badge>');
		drugBadge = compile(drugBadge)(scope);
		scope.$apply();

		var badgeSpan = drugBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('DABRAFENIB');
		expect(badgeSpan.hasClass('ct-badge-drug')).toBeTruthy();
	});

	it('should be able to generate a variant category badge', function() {
		// Structural Variation variant category from treatment list match criteria
		scope.genomicObject = mockTrial.treatment_list.step[0].match[0].and[0].and[0].or[0].genomic;
		scope.variant_category_value = scope.genomicObject.variant_category;
		variantCategoryBadge = angular.element('<clinical-trial-badge category="variant_category" value="variant_category_value" view="variant_category_value"></clinical-trial-badge>');
		variantCategoryBadge = compile(variantCategoryBadge)(scope);
		scope.$apply();

		var badgeSpan = variantCategoryBadge.find('span');
		expect(badgeSpan.text().trim()).toEqual('Structural Variation');
		expect(badgeSpan.hasClass('ct-badge-variant-category')).toBeTruthy();
	});
});