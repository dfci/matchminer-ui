'use strict';

angular.module('matchminerUiApp')
	.config(function ($stateProvider) {
		$stateProvider
			.state('filter-edit', {
				url: '/filters/edit/{id}',
				parent: 'filters-overview',
				params: {
					'id': {
						value: null,
						squash: true
					}
				},
				data: {
					pageTitle: 'MatchMiner - Edit filter',
					authorities: ['cti', 'admin']
				},
				views: {
					'content@dashboard': {
						templateUrl: 'scripts/app/dashboard/filters/filter-editor/filter-editor.html',
						controller: 'FilterEditorCtrl',
						controllerAs: 'fe'
					}
				},
				ncyBreadcrumb: {
					label: 'Edit Filter'
				},
				resolve: {}
			})
			.state('filter-new', {
				url: '/filters/new',
				parent: 'filters-overview',
				data: {
					pageTitle: 'MatchMiner - New filter',
					authorities: ['cti', 'admin']
				},
				views: {
					'content@dashboard': {
						templateUrl: 'scripts/app/dashboard/filters/filter-editor/filter-editor.html',
						controller: 'FilterEditorCtrl',
						controllerAs: 'fe'
					}
				},
				ncyBreadcrumb: {
					label: 'New Filter'
				},
				resolve: {}
			});
	});
