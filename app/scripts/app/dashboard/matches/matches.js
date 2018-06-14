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
			.state('matches', {
				url: '/matches',
				parent: 'dashboard',
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
