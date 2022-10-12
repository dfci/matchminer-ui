'use strict';

angular.module('matchminerUiApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('matches', {
				url: '/matches',
				parent: 'dashboard',
				params: {
					'filter_id': null,
				},
				data: {
					pageTitle: 'MatchMiner - Matches',
					authorities: ['cti', 'admin']
				},
				views: {
					'content': {
						templateUrl: 'scripts/app/dashboard/matches/matches.html',
						controller: 'MatchesCtrl',
						controllerAs: 'dbm'
					}
				},
				ncyBreadcrumb: {
					label: 'Matching / Patient Matches'
				},
				resolve: {}
			});
	});
