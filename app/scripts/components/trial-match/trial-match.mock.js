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
 * @Service TrialMatchMocks
 * @Description Service layer exposing mock trial matches
 */
angular.module('matchminerUiApp')
	.factory('TrialMatchMocks',
		function () {
			var service = {};

			service.mockTrialMatches = function () {
				return {
					_items: [
						{
							"_updated": "Thu, 01 Jan 1970 00:00:00 GMT",
							"ONCOTREE_PRIMARY_DIAGNOSIS_NAME": "Cutaneous Melanoma",
							"code": "S1-MEL",
							"internal_id": "13825",
							"ORD_PHYSICIAN_NAME": "Luciano Lester [fake] M.D.",
							"MRN": "TCGA-EE-A2GO",
							"ORD_PHYSICIAN_EMAIL": "Luciano@fake_email.com",
							"match_level": "arm",
							"REPORT_DATE": "Tue, 24 Sep 2013 08:00:00 GMT",
							"SAMPLE_ID": "TCGA-EE-A2GO-06",
							"genomic_alteration": "!BRAF p.V600",
							"protocol_no": "15-207",
							"_created": "Thu, 01 Jan 1970 00:00:00 GMT"
						}, {
							"_updated": "Thu, 01 Jan 1970 00:00:00 GMT",
							"ONCOTREE_PRIMARY_DIAGNOSIS_NAME": "Cutaneous Melanoma",
							"code": "NS1-MEL",
							"internal_id": "16194",
							"ORD_PHYSICIAN_NAME": "Luciano Lester [fake] M.D.",
							"MRN": "TCGA-EE-A2GO",
							"ORD_PHYSICIAN_EMAIL": "Luciano@fake_email.com",
							"match_level": "arm",
							"REPORT_DATE": "Tue, 24 Sep 2013 08:00:00 GMT",
							"SAMPLE_ID": "TCGA-EE-A2GO-06",
							"genomic_alteration": "!BRAF p.V600",
							"protocol_no": "15-207",
							"_created": "Thu, 01 Jan 1970 00:00:00 GMT"
						}, {
							"_updated": "Thu, 01 Jan 1970 00:00:00 GMT",
							"ONCOTREE_PRIMARY_DIAGNOSIS_NAME": "Cutaneous Melanoma",
							"code": "S2-MEL",
							"internal_id": "15300",
							"ORD_PHYSICIAN_NAME": "Luciano Lester [fake] M.D.",
							"MRN": "TCGA-EE-A2GO",
							"ORD_PHYSICIAN_EMAIL": "Luciano@fake_email.com",
							"match_level": "arm",
							"REPORT_DATE": "Tue, 24 Sep 2013 08:00:00 GMT",
							"SAMPLE_ID": "TCGA-EE-A2GO-06",
							"genomic_alteration": "!BRAF p.V600",
							"protocol_no": "15-207",
							"_created": "Thu, 01 Jan 1970 00:00:00 GMT"
						}, {
							"_updated": "Thu, 01 Jan 1970 00:00:00 GMT",
							"ONCOTREE_PRIMARY_DIAGNOSIS_NAME": "Cutaneous Melanoma",
							"code": "NS2-MEL",
							"internal_id": "16193",
							"ORD_PHYSICIAN_NAME": "Luciano Lester [fake] M.D.",
							"MRN": "TCGA-EE-A2GO",
							"ORD_PHYSICIAN_EMAIL": "Luciano@fake_email.com",
							"match_level": "arm",
							"REPORT_DATE": "Tue, 24 Sep 2013 08:00:00 GMT",
							"SAMPLE_ID": "TCGA-EE-A2GO-06",
							"genomic_alteration": "!BRAF p.V600",
							"protocol_no": "15-207",
							"_created": "Thu, 01 Jan 1970 00:00:00 GMT"
						}
					]
				};
			};

			return service;
		});

