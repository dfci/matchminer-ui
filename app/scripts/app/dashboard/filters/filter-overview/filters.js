'use strict';

angular.module('matchminerUiApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('filters-overview', {
				parent: 'dashboard',
				url: '/filters',
				data: {
					authorities: ['cti', 'admin'],
					pageTitle: 'MatchMiner - Filters'
				},
				views: {
					'content@dashboard': {
						templateUrl: 'scripts/app/dashboard/filters/filter-overview/filters.html',
						controller: 'FiltersCtrl',
						controllerAs: 'dbf'
					}
				},
				ncyBreadcrumb: {
					label: 'Matching / Filters'
				}
			});
	});
