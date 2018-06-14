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
 * @Service AutocompleteMocks
 * @Description Service layer exposing autocomplete mocks
 */
angular.module('matchminerUiApp')
	.factory('AutocompleteMocks',
		function () {
			var service = {};

			service.mockProteinChanges = function () {
				return {
					"values": [
						"p.D916D",
						"p.H773D",
						"p.C307C",
						"p.A118A",
						"p.T488S",
						"p.K1160K",
						"p.R836C",
						"p.T6T",
						"p.R98Q",
						"p.R527W",
						"p.L480L",
						"p.W880X"
					],
					"field": "TRUE_PROTEIN_CHANGE",
					"resource":"genomic"
				};
			};

			service.mockTranscriptExons = function() {
				return {
					"values": [
						1,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						13,
						14,
						15,
						16,
						18
					],
					"field": "TRUE_TRANSCRIPT_EXON",
					"resource":"genomic"
				};
			};

			return service;
		});

