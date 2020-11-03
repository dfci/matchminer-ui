/**
 * Service for the filter resource
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('ElasticSearchREST',
		['$resource', 'ENV',
			function ($resource, ENV) {
				return $resource(ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index, {}, {
					'findTrialsBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/trial/_search',
						isArray: false
					},
					'findGenomicFiltersBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/genomic/_search',
						isArray: false
					},
					'findClinicalBy': {
						method: 'POST',
						url: ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/clinical/_search',
						isArray: false
					}
				});
			}
		]);
