

'use strict';

angular.module('matchminerUiApp')
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('faq', {
				parent: 'site',
				url: '/faq',
				data: {
					authorities: []
				},
				views: {
					'': {
						templateUrl: 'scripts/app/public/faq/faq.html',
						controller: 'FaqCtrl',
						controllerAs: 'fc'
					},
					'nav@faq': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					}
				}
			});
	}]);
