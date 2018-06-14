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
 * @Service MatchesMocks
 * @Description Service layer exposing mock matches
 */
angular.module('matchminerUiApp')
	.factory('MatchesMocks',
		function () {
			var service = {};

			service.mockMatchesResponse = function() {
				return {
					_meta: {
						total: 2,
						page: 1
					},
					_items: [
						{
							EMAIL_ADDRESS: "Luciano@fake_email.com",
							EMAIL_BODY: "",
							EMAIL_SUBJECT: "(test) ONCO PANEL RESULTS",
							ENROLLED: false,
							FILTER_NAME: "test",
							FILTER_STATUS: 1,
							MATCH_STATUS: 0,
							MMID: "E185A3",
							ONCOTREE_BIOPSY_SITE_TYPE: "Any/Other",
							ONCOTREE_PRIMARY_DIAGNOSIS_NAME: "Cutaneous Melanoma",
							PATIENT_MRN: "TCGA-EE-A2GO",
							REPORT_DATE: "Tue, 24 Sep 2013 08:00:00 GMT",
							TEAM_ID: "577cf6ef2b9920002e041cb3",
							TRUE_HUGO_SYMBOL: "EGFR",
							USER_ID: "577cf6ef2b9920002cef0337",
							VARIANTS: [
								{
									SOMATIC_STATUS: "Likely Somatic",
									BESTEFFECT_TRANSCRIPT_EXON: 3,
									TRUE_ENTREZ_ID: "0"
								}
							],
							VARIANT_CATEGORY: "MUTATION",
							_created: "Thu, 01 Jan 1970 00:00:00 GMT",
							_id: "5800fcc4366d75002c10f06c",
							FILTER_ID: "577cf6ef2b9920002cef0338"
						},
						{
							EMAIL_ADDRESS: "harry@fake_email.com",
							EMAIL_BODY: "",
							EMAIL_SUBJECT: "(test) ONCO PANEL RESULTS",
							ENROLLED: false,
							FILTER_NAME: "test",
							FILTER_STATUS: 1,
							MATCH_STATUS: 3,
							MMID: "A11921",
							ONCOTREE_BIOPSY_SITE_TYPE: "Any/Other",
							ONCOTREE_PRIMARY_DIAGNOSIS_NAME: "Cutaneous Melanoma",
							PATIENT_MRN: "TCGA-AB-AT15",
							REPORT_DATE: "Tue, 24 Sep 2013 08:00:00 GMT",
							TEAM_ID: "577cf6ef2b9920002e0",
							TRUE_HUGO_SYMBOL: "ABL2",
							USER_ID: "577cf6ef2b9920002cef0337",
							VARIANTS: [
								{
									SOMATIC_STATUS: "Likely Somatic",
									BESTEFFECT_TRANSCRIPT_EXON: 3,
									TRUE_ENTREZ_ID: "0"
								}
							],
							VARIANT_CATEGORY: "MUTATION",
							_created: "Thu, 01 Jan 1970 00:00:00 GMT",
							_id: "5800fcc4366d75002c10f06c",
							FILTER_ID: "577cf6ef2b9920002cef0338"
						}
					]
				}
			};

			return service;
		});

