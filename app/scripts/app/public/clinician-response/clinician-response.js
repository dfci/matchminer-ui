'use strict';

angular.module('matchminerUiApp')
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('clinician-response', {
				parent: 'site',
				url: '/response/:id',
				data: {
					authorities: []
				},
				views: {
					'': {
						templateUrl: 'scripts/app/public/clinician-response/clinician-response.html',
						controller: 'ClinicianResponseCtrl',
						controllerAs: 'cr'
					},
					'nav@clinician-response': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				}
			});
	}]);
