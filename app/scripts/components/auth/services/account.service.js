'use strict';

angular.module('matchminerUiApp')
	.factory('Account', ['$resource', 'ENV',
		function Account($resource, ENV) {
			return $resource(ENV.api.endpoint + '/user/:id', {
				'id': '@id'
			}, {
				'get': {
					method: 'GET',
					isArray: false
				}
			});

		}]);
