'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller:EpicCtrl
 * @description
 * # EpicCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('EpicCtrl',
		['$scope', '$log', 'ENV',
			function ($scope, $log, ENV) {
				var ec = this;
				$scope.ENV = ENV;

				return ec;
			}]);
