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
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('early-adopter', {
				parent: 'site',
				url: '/early-adopter',
				data: {
					authorities: []
				},
				views: {
					'': {
						templateUrl: 'scripts/app/public/early-adopter/early-adopter.html',
						controller: 'EarlyAdopterCtrl',
						controllerAs: 'eac'
					},
					'nav@early-adopter': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				},
				ncyBreadcrumb: {
					label: 'Early Adopter'
				}
			});
	}]);
