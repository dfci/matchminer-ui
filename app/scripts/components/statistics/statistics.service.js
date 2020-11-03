/**
 * Created by zachary on 9/21/16.
 * Service for the statistics page
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('StatisticsService',
		['$resource', 'ENV', function($resource, ENV) {
		return $resource(ENV.api.endpoint + '/statistics');
	}]);
