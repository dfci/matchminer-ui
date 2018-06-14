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
