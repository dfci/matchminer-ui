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
 * @Service PatientsMocks
 * @Description Service layer exposing mock patient clinical data
 */
angular.module('matchminerUiApp')
	.factory('PatientsMocks',
		function () {
			var service = {};

			service.mockPatientClinical = function() {
				return [
					{
						_id: "1234567890",
						"FIRST_NAME": "NANCY",
						"LAST_NAME": "FAKINGTON",
						SAMPLE_ID: "sample 01",
						REPORT_DATE: 1481289271827,
						RELATED: [{
							_id: "0987654321",
							FIRST_NAME: "NANCY",
							"LAST_NAME": "FAKINGTON",
							SAMPLE_ID: "sample 02",
							REPORT_DATE: 1481281986429
						}]
					},
					{
						_id: "1234537890",
						"FIRST_NAME": "DREW",
						"LAST_NAME": "HARLINGTON",
						SAMPLE_ID: "sample 03",
						REPORT_DATE: 1481289271827
					}
				];
			};

			service.mockGenomicCNV = function() {
				return {
					_items: [
						{
							"CNV_CALL": "High Amplification",
							"TRUE_HUGO_SYMBOL": "EGFR"
						}
					]
				};
			};

			service.mockGenomicSV = function() {
				return {
					_items: [
						{
							TRUE_HUGO_SYMBOL: "KRAS",
							VARIANT_CATEGORY: "",
							WILD_TYPE: true
						}
					]
				};
			};

			service.mockNegativeGenomic = function() {
				return {
					_items: [
						{
							_updated: "Thu, 01 Jan 1970 00:00:00 GMT",
							clinical_id: "1234567890",
							coverage: 10000,
							coverage_type: "NPLC",
							entire_gene: false,
							sample_id: "TCGA-1111",
							true_codon: null,
							true_hugo_symbol: "AURKA",
							true_transcript_exon: 4
						},
						{

							_updated: "Thu, 01 Jan 1970 00:00:00 GMT",
							clinical_id: "1234567890",
							coverage: 10000,
							coverage_type: "PLC",
							entire_gene: false,
							sample_id: "TCGA-1111",
							true_codon: null,
							true_hugo_symbol: "MAP3K1",
							true_transcript_exon: 1
						},
						{
							_updated: "Thu, 01 Jan 1970 00:00:00 GMT",
							clinical_id: "1234567890",
							coverage: 10000,
							coverage_type: "PN",
							entire_gene: false,
							sample_id: "TCGA-1111",
							true_codon: 17,
							show_codon: true,
							true_hugo_symbol: "AKT1",
							true_transcript_exon: null
						}
					]
				};
			};

			service.mockGenomicMutation = function() {
				return {
					_items: [
						{
							TRUE_HUGO_SYMBOL: "KRAS",
							VARIANT_CATEGORY: "",
							TIER: 1,
							WILD_TYPE: false
						},
						{
							TRUE_HUGO_SYMBOL: "EGFR",
							VARIANT_CATEGORY: "",
							TIER: 3,
							WILD_TYPE: false
						},
						{
							TRUE_HUGO_SYMBOL: "BRCA",
							VARIANT_CATEGORY: "",
							TIER: 4,
							WILD_TYPE: false
						},
						{
							TRUE_HUGO_SYMBOL: "ABL1",
							VARIANT_CATEGORY: "",
							TIER: 2,
							WILD_TYPE: false
						}
					]
				};
			};

			service.mockGenomicSignature = function() {
				return {
					_items: [
						{
							TRUE_HUGO_SYMBOL: null,
							VARIANT_CATEGORY: "",
							TIER: null,
							WILD_TYPE: false
						}
					]
				};
			};

			return service;
		});

