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
 * @Service FilterMocks
 * @Description Service layer exposing mock filters and properties
 */
angular.module('matchminerUiApp')
	.factory('FiltersMocks', ['ENV',
		function (ENV) {
			var service = {};

			// Filter properties

			// Oncotree diagnoses
			service.mockOncotreeDiagnoses = function () {
				return {
					'values':
					[
						{
							text: 'Colorectal Cancer'
						},
						{
							text: 'Bladder Cancer'
						},
						{
							text: 'Melanoma'
						},
						{
							text: 'Prostate Cancer'
						},
						{
							text: 'Cervical Cancer'
						}
					]
				}
			};

			service.mockFilters = function() {
				return {
					'_meta': {
						total: 3,
						page: 1
					},
					'_items': [
						{
							_id: "1234567890abcdef",
							label: 'test filter',
							protocol_id: ENV.resources.institution + ' protocol ID',
							genomic_filter: {
								TRUE_HUGO_SYMBOL: ['ABL1']
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: '_SOLID_',
								BIRTH_DATE: {
									'^gte': new Date().getFullYear() - 18
								},
								REPORT_DATE: {
									'^lte': 6
								}
							},
							status: 2
						},
						{
							label: 'test filter 2',
                            protocol_id: ENV.resources.institution + ' protocol ID 02',
							genomic_filter: {
								TRUE_HUGO_SYMBOL: ['ABL1', 'EGFR']
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: 'Lung Adenocarcinoma',
								BIRTH_DATE: {
									'^lte': new Date().getFullYear() - 18
								},
								REPORT_DATE: {
									'^lte': 3
								}
							},
							status: 2
						},
						{
							label: 'test filter 3',
                            protocol_id: ENV.resources.institution + ' protocol ID 03',
							genomic_filter: {
								TRUE_HUGO_SYMBOL: ['ABL3', 'EGFR']
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: 'Lung Adenocarcinoma',
								BIRTH_DATE: {},
								REPORT_DATE: {}
							},
							status: 2
						}
					]
				}
			};

			return service;
		}]);

