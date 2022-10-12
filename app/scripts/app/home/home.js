'use strict';

angular.module('matchminerUiApp')
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('home', {
				parent: 'site',
				url: '/',
				params: {
					'error': null,
					'errorMessage': null,
					'errorDetails': null
				},
				data: {
					authorities: []
				},
				views: {
					'': {
						templateUrl: 'scripts/app/home/home.html',
						controller: 'HomeCtrl',
						controllerAs: 'hc'
					},
					'nav@home': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					},
					'clinical-trials-search@home': {
						templateUrl: 'scripts/app/clinical-trials/search/clinical-trials-search.html',
						controller: 'ClinicalTrialsSearchCtrl',
						controllerAs: 'cts'
					}
				},
				ncyBreadcrumb: {
					label: 'home',
					parent: 'site'
				}
			})
	}]);
