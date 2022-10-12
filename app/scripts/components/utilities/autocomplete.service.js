/**
 * Service for accessing the Autocomplete resource
 */

'use strict';

angular.module('matchminerUiApp')
	.factory('AutocompleteService',
		['$http', '$resource', 'ENV',
			function ($http, $resource, ENV) {
				return $resource(ENV.api.endpoint + '/utility/autocomplete', {
					resource: '@resource',
					field: '@field',
					value: '@value',
					gene: '@gene'
				}, {
					'queryAutocomplete': {
						method: 'GET',
						isArray: false,
						cancellable: false
					}
				});
			}
		]);
