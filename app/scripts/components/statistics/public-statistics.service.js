/**
 * Created by bernd on 10/06/16.
 * Service for the public statistics page
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('PublicStatisticsService',
		['$resource', 'ENV', function($resource, ENV) {
		return $resource(ENV.api.endpoint + '/public_stats');
	}]);
