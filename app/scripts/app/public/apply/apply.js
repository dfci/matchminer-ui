'use strict';

angular.module('matchminerUiApp')
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('apply-for-access', {
				parent: 'site',
				url: '/apply-for-access',
				data: {
					authorities: [],
					pageTitle: 'MatchMiner - Apply for Access',
				},
				views: {
					'@': {
						templateUrl: 'scripts/app/public/apply/apply.html',
						controller: 'ApplyCtrl',
						controllerAs: 'ac'
					},
					'navbar@apply-for-access': {
						templateUrl: 'scripts/components/navbar/navbar.html',
						controller: 'NavbarCtrl',
						controllerAs: 'nbc'
					},
				}
			});
	}]);
