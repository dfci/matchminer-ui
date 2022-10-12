

'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller:ClinicianResponseCtrl
 * @description
 * # ClinicianResponseCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('FaqCtrl',
		['$log', 'ENV',
			function ($log, ENV) {
				var fc = this;
				fc.ENV = ENV;

				return fc;
			}]);
