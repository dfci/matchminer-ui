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
/**
 * @Service ClinicalTrialsMocks
 * @Description Service layer exposing mock clinical trials and filters
 */
angular.module('matchminerUiApp')
	.factory('ClinicalTrialsMocks', ['ENV',
		function (ENV) {
			var service = {};

			service.mockClinicalTrials = function () {
				return [
					{
						'id': '13-304',
						'protocol_no': '13-304',
						'short_title': 'BRAF-MEK Inhibitors for BRAF Mutant Melanoma',
						'long_title': 'A Sequential Safety and Biomarker Study of BRAF-MEK Inhibition on the Immune Response in the context of CTLA-4 blockade for BRAF Mutant Melanoma',
						'nct_number': 'NCT01940809',
						'phase': '1',
						'age': 'Adults',
						'stage': 'Unresectable or metastatic',
						'status': 'open',
						'_summary': {
							status: [
								{
									value: 'Open to Accrual'
								}
							],
							'dfci_investigator': {
								'institute': 'Dana-Farber Cancer Institute',
								'email': 'email@address',
								'is_overall_pi': true,
								'name': 'Last, First',
								'staff_role':  ENV.resources.institution +' Principal Investigator'
							},
							'nonsynonymous_genes': ['BRAF'],
							'nonsynonymous_wt_genes': ['wt NRAS', 'wt KRAS', 'wt PDGFRA', 'wt KIT'],
							'disease_status': ['Metastatic', 'Recurrent', 'Advanced', 'Unresectable'],
							'tumor_types': ["Non-Seminomatous Germ Cell Tumor", "Germ Cell Tumor, Brain", "Biliary Tract", "Diffuse Glioma"],
							'accrual_goal': 8,
							'age_summary': 'Adults',
							'coordinating_center': 'Dana-Farber Cancer Institute',
							'disease_center': 'DF/HCC Neuro-Oncology',
							'drugs': ["DABRAFENIB", "TRAMETINIB"],
							'genes': ["wt NRAS", "wt KRAS", "BRAF", "wt PDGFRA", "wt KIT"],
							'investigator': 'Wen, Patrick, Yung',
							'nct_number': 'NCT02034110',
							'phase_summary': 'II',
							'protocol_number': '14-126',
							'sponsor': 'GlaxoSmithKline',
						},
						'drug_list':{
							'drug': [
								{
									drug_name: 'DABRAFENIB'
								},
								{
									drug_name: 'TRAMETINIB'
								}
							]
						},
						'prior_treatment_requirement': [
							'No prior systemic anti-cancer therapy within the last 3 weeks',
							'No chemotherapy regimens without delayed toxicity within the last 2 weeks preceding the first dose of study treatment',
							'No use of other investigational drugs within 28 days preceding the first dose of study treatment and during the study',
							'No history of treatment with BRAF or MEK inhibitors',
							'No prior treatment with anti-PD-1, anti-PD-L1, anti-PD-L2, anti-CTLA-4 antibody, or any other antibody or drug specifically targeting T-cell co-stimulation or immune checkpoint pathways'
						],
						'oncopro_link': 'http://webctportal.partners.org/oncpro/documents/0/E/2/1/ELI04461v6.pdf',
						'summary': 'This randomized phase I trial studies the side effects and best way to give ipilimumab with or without dabrafenib, trametinib and/or nivolumab in treating patients with melanoma that has spread to other parts of the body (metastatic) or cannot be removed by surgery. Monoclonal antibodies, such as ipilimumab and nivolumab, may interfere with the ability of cancer cells to grow and spread. Dabrafenib and trametinib may stop the growth of tumor cells by blocking some of the enzymes needed for cell growth. It is not yet known whether ipilimumab works better with or without dabrafenib, trametinib, and/or nivolumab in treating melanoma.',
						"treatment_list": {
							"step": [
								{
									"arm": [
										{
											"arm_code": "DOSE",
											"arm_description": "DOSE LEVELS",
											"arm_internal_id": 12761,
											"arm_suspended": "N",
											"dose_level": [
												{
													"level_code": "S",
													"level_description": "STANDARD 50 MG",
													"level_internal_id": 7463,
													"level_suspended": "N"
												},
												{
													"level_code": "HPT",
													"level_description": "HEAVILY PRE-TREATED 37.5 MG",
													"level_internal_id": 7464,
													"level_suspended": "N"
												}
											]
										}
									],
									"match": [
										{
											"and": [
												{
													"and": [
														{
															"or": [
																{
																	"genomic": {
																		"hugo_symbol": "RET",
																		"variant_category": "Structural Variation"
																	}
																},
																{
																	"genomic": {
																		"cnv_call": "High Amplification",
																		"hugo_symbol": "RET",
																		"variant_category": "Copy Number Variation"
																	}
																}
															]
														},
														{
															"genomic": {
																"hugo_symbol": "EGFR",
																"variant_category": "Mutation",
																"protein_change": "p.19x71"
															}
														},
														{
															"genomic": {
																"hugo_symbol": "KRAS",
																"wildtype": true
															}
														},
														{
															"genomic": {
																"hugo_symbol": "ABL1",
																"variant_category": "Mutation",
																"protein_change": "!p.92J2h8"
															}
														},
														{
															"genomic": {
																"hugo_symbol": "ALK",
																"variant_category": "Mutation",
																"exon": 19,
																"variant_classification": 'In_Frame_Del'
															}
														},
														{
															"genomic": {
																"hugo_symbol": "ALK",
																"variant_category": "Mutation",
																"exon": 19
															}
														},
														{
															"genomic": {
																"hugo_symbol": "CCND1",
																"display_name": "IGH-CCND1",
																"variant_category": "Structural Variation"
															}
														}
													]
												},
												{
													"or": [
														{
															"clinical": {
																"age_numerical": ">=18",
																"oncotree_primary_diagnosis": "Lung Adenocarcinoma"
															}
														},
														{
															"clinical": {
																"age_numerical": ">=18",
																"oncotree_primary_diagnosis": "Lung Adenosquamous Carcinoma"
															}
														},
														{
															"clinical": {
																"age_numerical": ">=18",
																"oncotree_primary_diagnosis": "Poorly Differentiated Non-Small Cell Lung Cancer"
															}
														},
														{
															"clinical" : {
																age_numerical: ">=18",
																er_status: "Positive",
																her2_status: "Negative",
																oncotree_primary_diagnosis: "Invasive Breast Carcinoma",
																pr_status: "Unknown"
															}
														},
														{
															"clinical" : {
																age_numerical: ">=18",
																er_status: "Negative",
																her2_status: "Positive",
																oncotree_primary_diagnosis: "Invasive Breast Carcinoma",
																pr_status: "Negative"
															}
														}
													]
												}
											]
										}
									],
									"step_code": "1",
									"step_internal_id": 11061,
									"step_type": "Registration"
								}
							]
						},
						staff_list: {
							protocol_staff: [
								{
									"email_address": "john@doe.org",
									"first_name": "John",
									"institution_name": "Massachusetts General Hospital",
									"last_name": "Doe",
									"middle_name": "Dublee",
									"npi": "",
									"phone_no": "123-456-678",
									"staff_role": "Site Principal Investigator",
									"start_date": 1416805200000,
									"stop_date": 1426651200000
								},
								{
									"email_address": "jane@doe.org",
									"first_name": "Jane",
									"institution_name": "Dana-Farber Cancer Institute",
									"last_name": "Doe",
									"middle_name": "Dublee",
									"npi": "",
									"phone_no": "987-654-321",
									"staff_role": "Overall Principal Investigator",
									"start_date": 1416805200001,
									"stop_date": 1426651200002
								}
							]
						}
					}
				];
			};

			service.mockVariants = function() {
				return [
					{
						"hugo_symbol": "RET",
						"specific_alteration": "RET",
						"variant_category": "Structural Variation"
					},
					{
						"hugo_symbol": "RET",
						"specific_alteration": "High Amplification",
						"variant_category": "Copy Number Variation"
					},
					{
						"hugo_symbol": "EGFR",
						"specific_alteration": "p.19x71",
						"variant_category": "Mutation"
					},
					{
						"hugo_symbol": "KRAS",
						"specific_alteration": "Wild-type",
						"variant_category": "---"
					},
					{
						"hugo_symbol": "ALK",
						"specific_alteration": "In Frame Del Exon 19",
						"variant_category": "Mutation"
					},
					{
						"hugo_symbol": "ALK",
						"specific_alteration": "Exon 19",
						"variant_category": "Mutation"
					},
					{
						"hugo_symbol": "CCND1",
						"specific_alteration": "CCND1",
						"variant_category": "Structural Variation"
					}
				];
			};

			service.getNoPriorityContext = function() {
				return {
					'highlight': {
						'protocol_id': ['1234567890']
					}
				}
			};

			service.getPriorityContext = function() {
				return {
					'highlight': {
						'protocol_no': ['12-123'],
						'principal_investigator': ['Investigator, Test, Middlename'],
						'short_title': ['Short title for trial'],
						'nct_purpose': ["The purpose of this trial is to test whether the unit test works."]
					}
				}
			};

			// Filter categories present in the UI
			service.mockFilterCategories = function () {
				var filterCategories = [];

				return filterCategories;
			};

			service.getSearchAggregators = function() {
				return {
					"gene": {
						"terms": {
							"field": "_genomic.hugo_symbol.value"
						}
					},
					"disease_status": {
						"terms": {
							"field": "_clinical.stage.value"
						}
					},
					"phase": {
						"terms": {
							"field": "_summary.phase.value"
						}
					}
				}
			};

			/**
			 * Mocks for search filters
			 */
			service.getFilter = function () {
				return {
					'or': [
						{
							'terms': {
								'_summary.phase.value': '1'
							}
						}
					]
				};
			};

			service.getSearchFilters = function() {

				var filterObj = [];

				var o = {
					'or': [
						{
							'terms': {
								'_summary.phase.value': ['1']
							}
						},
						{
							'terms': {
								'_genomic.hugo_symbol.value': ['EGFR']
							}
						},
						{
							'terms': {
								'_summary.age.value': ['23']
							}
						}
					]
				};
				filterObj.push(o);

				return filterObj;
			};

			service.getFiltersExcludedWithHugoSymbol = function() {
				return [
					{
						'or': [
							{
								'terms': {
									'_summary.phase.value': ['1']
								}
							}
						]
					},
					{
						'or': [
							{
								'terms': {
									'_summary.age.value': ['23']
								}
							}
						]
					}
				];
			};


			// Active filters applied to the elasticsearch
			service.mockFilters = function () {
				var filters = [
					{
						'name': 'Tumor Type',
						'property': 'ONCOTREE_DIAGNOSIS',
						'showAll': true,
						'options': [
							{
								'name': 'Bladder Cancer',
								'checked': false,
								'count': 129,
								'property': 'Bladder Cancer'
							},
							{
								'name': 'Cervical Cancer',
								'checked': false,
								'count': 13,
								'property': 'Cervical Cancer'
							},
							{
								'name': 'Colorectal Cancer',
								'checked': false,
								'count': 65,
								'property': 'Colorectal Cancer'
							},
							{
								'name': 'Melanoma',
								'checked': false,
								'count': 182,
								'property': 'Melanoma'
							},
							{
								'name': 'Prostate Cancer',
								'checked': false,
								'count': 89,
								'property': 'Prostate Cancer'
							}
						]
					},
					{
						'name': 'Genomic Alteration',
						'property': 'ONCOTREE_PRIMARY_DIAGNOSIS',
						'showAll': true,
						'options': [
							{
								'name': 'Missense Mutation',
								'checked': false,
								'count': 15,
								'property': 'MISSENSE'
							},
							{
								'name': 'Splice Site',
								'checked': false,
								'count': 1,
								'property': 'SPLICE'
							},
							{
								'name': 'Heterozygous deletion',
								'checked': false,
								'count': 19,
								'property': '2DEL'
							}
						]

					},
					{
						'name': 'Phase',
						'property': 'PHASE',
						'showAll': true,
						'options': [
							{
								'name': 'Phase I',
								'checked': false,
								'count': 11,
								'property': '1'
							},
							{
								'name': 'Phase II',
								'checked': false,
								'count': 144,
								'property': '2'
							},
							{
								'name': 'Phase III',
								'checked': false,
								'count': 212,
								'property': '3'
							}
						]
					},
					{
						'name': 'Status',
						'property': 'STATUS',
						'showAll': true,
						'options': [
							{
								'name': 'Open',
								'checked': false,
								'count': 45,
								'property': 'OPEN'
							},
							{
								'name': 'Suspended',
								'checked': false,
								'count': 1,
								'property': 'SUSPENDED'
							},
							{
								'name': 'Closed',
								'checked': false,
								'count': 143,
								'property': 'CLOSED'
							}
						]
					}
				];

				return filters;
			};

			service.mockStatusCssForTrial = function() {
				return {
					'ct-badge-status-green' : true,
					'ct-badge-status-grey' : false,
					'ct-badge-status-yellow' : false,
					'ct-badge-status-red' : false,
					'md-fab md-raised md-mini ct-badge-fab dark' : true,
					'ct-badge ct-badge-details': false
				};
			};

			service.getFacetOptionsState = function() {
				return {
					'Gene (Mutant)' : 5,
					'Gene (Wildtype)': 5,
					'Tissue': 100
				}
			};

			return service;
		}]);

