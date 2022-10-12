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
