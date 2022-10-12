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
								TRUE_HUGO_SYMBOL: ['ABL1'],
								TRUE_TRUE_PROTEIN_CHANGE: [],
								TEST_NAME: 'oncopanel'
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: '_SOLID_',
								AGE_NUMERICAL: {
									'^gte': 18
								},
								REPORT_DATE: {
									'^lte': 6
								},
								TEST_NAME: 'oncopanel'
							},
							status: 2
						},
						{
							label: 'test filter 2',
                            protocol_id: ENV.resources.institution + ' protocol ID 02',
							genomic_filter: {
								TRUE_HUGO_SYMBOL: ['ABL1', 'EGFR'],
								TRUE_TRUE_PROTEIN_CHANGE: [],
								TEST_NAME: 'oncopanel'
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: 'Lung Adenocarcinoma',
								AGE_NUMERICAL: {
									'^lte': 18
								},
								REPORT_DATE: {
									'^lte': 3
								},
								TEST_NAME: 'oncopanel'
							},
							status: 2
						},
						{
							label: 'test filter 3',
                            protocol_id: ENV.resources.institution + ' protocol ID 03',
							genomic_filter: {
								TRUE_HUGO_SYMBOL: ['ABL3', 'EGFR'],
								TRUE_TRUE_PROTEIN_CHANGE: [],
								TEST_NAME: 'oncopanel'
							},
							clinical_filter: {
								ONCOTREE_PRIMARY_DIAGNOSIS_NAME: 'Lung Adenocarcinoma',
								AGE_NUMERICAL: {},
								REPORT_DATE: {},
								TEST_NAME: 'oncopanel'
							},
							status: 2
						}
					]
				}
			};

			return service;
		}]);

