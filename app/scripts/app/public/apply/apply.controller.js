'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller:ClinicianResponseCtrl
 * @description
 * # ClinicianResponseCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('ApplyCtrl',
		['$log', 'ENV', '$window',
			function ($log, ENV, $window) {
				var afa = this;

				afa.applyForAccess = function () {
					$window.location.href = ENV.accessRequestFormLink;
				};

				return afa;
			}]);
