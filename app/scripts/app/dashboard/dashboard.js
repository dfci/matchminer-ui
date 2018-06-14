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
			.state('dashboard', {
				parent: 'site',
				url: '/dashboard',
				data: {
					pageTitle: 'MatchMiner - Dashboard',
					authorities: ['cti', 'oncologist', 'admin']
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/dashboard/dashboard.html',
                        controller: 'DashboardCtrl',
                        controllerAs: 'db'
					},
					'content@dashboard': {
						templateUrl: 'scripts/app/dashboard/dashboard.content.html',
						controller: 'DashboardCtrl',
						controllerAs: 'db'
					},
					'clinical-trials-search@dashboard': {
						templateUrl: 'scripts/app/clinical-trials/search/clinical-trials-search.html',
						controller: 'ClinicalTrialsSearchCtrl',
						controllerAs: 'cts'
					},
					'patient-search-input@dashboard': {
						templateUrl: 'scripts/app/dashboard/patients/patient-search/search/patient-search-input.html',
						controller: 'PatientSearchCtrl',
						controllerAs: 'psc'
					},
					'patient-search-results@dashboard': {
						templateUrl: 'scripts/app/dashboard/patients/patient-search/results/patient-search-results.html',
						controller: 'PatientSearchResultsCtrl',
						controllerAs: 'psrc'
					},
					'navbar@dashboard': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				},
				ncyBreadcrumb: {
					label: 'Dashboard',
					skip: true
				},
				onEnter: ['Principal', 'Idle', function (Principal, Idle) {
					if (Principal.isAuthenticated()) {
						Idle.watch();
					}
				}],
				onLeave: ['Principal', 'Idle', function (Principal, Idle) {
					if (Principal.isAuthenticated()) {
						Idle.unwatch();
					}
				}]
			});
	});
