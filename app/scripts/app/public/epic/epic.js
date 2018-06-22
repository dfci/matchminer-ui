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
			.state('epic-mrn-error', {
				parent: 'site',
				url: '/epic-mrn-error',
				data: {
					authorities: []
				},
				views: {
					'': {
						templateUrl: 'scripts/app/public/epic/error-mrn.html',
						controller: 'EpicCtrl',
						controllerAs: 'ec'
					}
				}
			})
            .state('epic-auth-error', {
                parent: 'site',
                url: '/epic-auth-error',
                data: {
                    authorities: []
                },
                views: {
                    '': {
                        templateUrl: 'scripts/app/public/epic/error-auth.html',
                        controller: 'EpicCtrl',
                        controllerAs: 'ec'
                    }
                }
            });
	}]);
