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

/**
 * @ngdoc overview
 * @name matchminerUiApp
 * @description
 * # matchminerUiApp
 *
 * Main module of the application.
 */
angular
	.module('matchminerUiApp', [
		'LocalStorageModule',
		'ngAnimate',
		'ngAria',
		'ngCookies',
		'ngMessages',
		'ngResource',
		'ngSanitize',
		'ui.router',
		'ngCacheBuster',
		'ngMaterial',
		'ngIdle',
		'md.data.table',
		'angular-loading-bar',
		'$q-spread',
		'duScroll',
		'datatables',
		'angularMoment',
		'chart.js',
		'color.picker',
		'ncy-angular-breadcrumb',
		'elasticsearch',
		'angular.filter',
		'ui.tree',
		'matchminer-templates',
		'uz.mailto',
		'underscore',
		'ng.deviceDetector',
		'angulartics',
		'angulartics.piwik'
	])
	/*
	 * Add underscore as constant
	 */
	.constant('_',
		window._
	)
	.run(['$rootScope', '$state', '$window', '$log', 'Principal', 'Auth', 'ENV', 'ElasticSearchService', 'ClinicalTrialsService', 'PatientsService', 'TrialMatchService',
		function ($rootScope, $state, $window, $log, Principal, Auth, ENV, ElasticSearchService, ClinicalTrialsService, PatientsService, TrialMatchService) {
			$rootScope.ENV = ENV;
			$rootScope.$on('$stateChangeError', function(e) {
				console.log("State change error : ", e);
			});

			$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
				$rootScope.toState = toState;
				$rootScope.toStateParams = toStateParams;

        ElasticSearchService.resetPatientSearchSize();

				if (Principal.isIdentityResolved()) {
					Auth.authorize();
				}
			});

			$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
				var titleKey = ENV.resources.institutionFull + ' - MatchMiner';

				$rootScope.previousStateName = fromState.name;
				$rootScope.previousStateParams = fromParams;

				// Only clear patient search results when you coming from the patient details
				if (toState.name != 'patient' && fromState.name != 'patient' && toState.name != 'patient-search' && toState.name != 'dashboard') {
					PatientsService.clearSearch();
				}
				if (toState.name == 'patient-trial-match' && fromState.name == 'patient') {
					TrialMatchService.resetSelectedTrialMatch();
					window.toPatientTrialMatchPage = true;
				} else {
					window.toPatientTrialMatchPage = false;
				}
				
				if (toState.name == 'patient') {
					TrialMatchService.resetTrialMatches();
					window.toPatientPage = true;
				} else {
					window.toPatientPage = false;
				}
                
				if (fromState.name == 'patient' && toState.name == "clinicaltrials.overview") {
						ClinicalTrialsService.resetSearchFilters();
				}

				// Set the page title key to the one configured in state or use default one
				if (toState.data.pageTitle) {
					titleKey = toState.data.pageTitle;
				}

				$window.document.title = titleKey;
			});

			$rootScope.back = function () {
				// If previous state is 'activate' or do not exist go to 'home'
				if ($rootScope.previousStateName === 'activate' || $state.get($rootScope.previousStateName) === null) {
					$state.go('home');
				} else {
					$state.go($rootScope.previousStateName, $rootScope.previousStateParams);
				}
			};

			$rootScope.$on('unauthorized', function(evt) {
				$rootScope.unauthorized = true;
				$state.go('home', {
					'error': true,
					'errorMessage': 'You are currently not authorized to access MatchMiner.',
					'errorDetails': 'If you have questions, please send email to: <a href="mailto:'+ ENV.resources.email +'">' + ENV.resources.email + '</a>.'
				});
			});
            
            $rootScope.$on('unauthPartUser', function(evt) {
                $rootScope.unauthorized = true;
                $state.go('home', {
                    'error': true,
                    'errorMessage': 'No MatchMiner account found for your Partners ID.',
                    'errorDetails': 'You are not authorized to access MatchMiner. ' +
                    'However, you can still search for clinical trials below.  To receive full access, please email ' +
                    'at <a href="mailto:'+ ENV.resources.email +'">' + ENV.resources.email + '</a>.'
                });
            });

		}])
	.config(['$httpProvider', '$urlMatcherFactoryProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider',
		'httpRequestInterceptorCacheBusterProvider', 'cfpLoadingBarProvider',
		'IdleProvider', 'KeepaliveProvider', '$breadcrumbProvider', '$mdThemingProvider',
		'ENV',
		function ($httpProvider, $urlMatcherFactoryProvider, $stateProvider, $urlRouterProvider, $locationProvider,
		          httpRequestInterceptorCacheBusterProvider, cfpLoadingBarProvider,
		          IdleProvider, KeepaliveProvider, $breadcrumbProvider, $mdThemingProvider,
		          ENV) {

			// Configure application theming
			$mdThemingProvider.theme('dashboard-theme')
				.primaryPalette('blue')
				.accentPalette('blue-grey');

			// Register Toast themes stylings for notifications
			$mdThemingProvider.theme('neutral-toast');
			$mdThemingProvider.theme('success-toast');
			$mdThemingProvider.theme('warn-toast');

			// Set piwik tracking site id globally.
			window._paq_vars = {};
			window._paq_vars.piwik_site_id = ENV.tracking.piwik_site_id;

			// Cache everything except rest api requests
			httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/], true);

			// Default route
			$urlRouterProvider.otherwise('/');
			$urlMatcherFactoryProvider.strictMode(false);

			// Disable angulars HTML 5 mode (No hash)
			$locationProvider.html5Mode({
				enabled: false
			});

			$httpProvider.useApplyAsync(true);

			// Global config for breadcrumbs in the app
			$breadcrumbProvider.setOptions({
				template: '<div class="breadcrumb"><div class="breadcrumb-container"><span ng-repeat="step in steps"> / <a href="{{step.ncyBreadcrumbLink}}" ng-bind-html="step.ncyBreadcrumbLabel"></a></span></div></div>',
				includeAbstract: true
			});

			//Abstract root state.
			$stateProvider.state('site', {
				abstract: true,
				template: '<div ui-view class=\'view-container\'></div>',
				ncyBreadcrumb: {
					label: 'MatchMiner'
				},
				resolve: {
					authorize: function (Auth) {
						return Auth.authorize();
					},
					UserAccount: function (Principal) {
						return Principal.identity(false);
					}
				}
			});

			// Disable spinner icon for loading bar
			cfpLoadingBarProvider.includeSpinner = false;

			// Session timeout provider settings
			IdleProvider.idle(ENV.sessionTimeout.idleAllowed);
			IdleProvider.timeout(ENV.sessionTimeout.idleCountdown);
			KeepaliveProvider.interval(10);

			//Add response and request interceptors
			$httpProvider.interceptors.push('requestInterceptor');
			$httpProvider.interceptors.push('responseInterceptor');

		}])
		.value('duScrollBottomSpy', true)
		.value('duScrollGreedy', true);

