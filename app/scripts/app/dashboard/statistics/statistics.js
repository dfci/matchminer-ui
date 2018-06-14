/*
 * Copyright (c) 2017. Dana-Farber Cancer Institute. All rights reserved.
 *
 *  Licensed under the GNU Affero General Public License, Version 3.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *
 * See the file LICENSE in the root of this repository.
 *
 * Contributing authors:
 * - berndvdveen
 *
 */

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
