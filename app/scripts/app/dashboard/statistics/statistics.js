'use strict';

angular.module('matchminerUiApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('statistics', {
				parent: 'dashboard',
				url: '/statistics',
				data: {
					pageTitle: 'MatchMiner - Usage statistics',
					authorities: ['admin']
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/dashboard/statistics/statistics.html'
					},
					'content@statistics': {
						templateUrl: 'scripts/app/dashboard/statistics/statistics.content.html',
						controller: 'StatisticsCtrl',
						controllerAs: 'sc'
					},
					'navbar@statistics': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				},
				ncyBreadcrumb: {
					label: 'Statistics'
				},
				resolve: {}
			});
	});
