'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the navbar
 */
angular.module('matchminerUiApp')
	.controller('NavbarCtrl',
		['$state', '$scope', '$log', '$document', '$window', 'Principal', 'Auth', 'ENV', 'UserAccount', 'Mailto', 'CookieService',
			function ($state, $scope, $log, $document, $window, Principal, Auth, ENV, UserAccount, Mailto, CookieService) {
				var vm = this;
				vm.isAuthenticated = Principal.isAuthenticated();
				vm.scroll = 0;
				vm.samlAuthenticated === ENV.samlAuthentication && vm.isAuthenticated;
				vm.login = Auth.login;
				vm.logout = Auth.logout;
				vm.hasAuthority = Principal.hasAuthority;
				vm.state = $state.current.name;
				vm.userAccount = UserAccount;
				vm.loginText = ENV.loginButtonText;

				$scope.$watch(function() {
					return $state.current.name;
				}, function(nv){
					vm.state = nv;

					//Set logo based on config in config.js
                    $(".mm-logo")
						.css('background','url(\'../images/' + ENV.resources.logo + '\')')
						.css('background-size','100%')
						.css('background-repeat', 'no-repeat');

                    vm.isFilterPage = false;
                    vm.isMatchesPage = false;
                    vm.isPatientSearchPage = false;
                    vm.isClinicalTrialPage = false;
                    vm.isHomeRoute = false;
                    vm.isStatisticsPage = false;

                    if (vm.state === "filters-overview") {
						vm.isFilterPage = true;
					}

					if (vm.state === "matches") {
						vm.isMatchesPage = true;
					}

					if (vm.state === "patient-search") {
						vm.isPatientSearchPage = true;
					}

					if (vm.state === "statistics") {
						vm.isStatisticsPage = true;
					}

					if (vm.state.indexOf('clinicaltrials') > -1) {
						vm.isClinicalTrialPage = true;
					}

					if (vm.state === "home" || vm.state === "dashboard") {
						vm.isHomeRoute = true;
					}
				});

				vm.applyForAccess = function () {
					$window.location.href = ENV.accessRequestFormLink;
				};

				/**
				 * Generate an email body and open an email window of the default email client
				 * prefilled with email address, subject and body.
				 *
				 * @param event
				 * @param trial
				 * @param coordinator_email
				 */
				vm.reportBug = function(event) {
					event.preventDefault();
					event.stopPropagation();

					var recipient = ENV.resources.email;
					var options = {
						subject: 'MatchMiner bug report - ' + vm.userAccount.first_name + ' ' + vm.userAccount.last_name,
						body: ''
					};

					var maillink = Mailto.url(recipient, options);

					window.location.href = maillink;
				};

				vm.scrollToSection = function (section) {
					$log.debug("Scrolling to section ", section);
					var scrollSection = angular.element(document.getElementById(section));
					return $document.scrollToElementAnimated(scrollSection, 150, 500);
				}

				vm.toggleBanner = function () {
					CookieService.setHideBanner();
					return vm.showBanner = !vm.showBanner;
				}

				vm.toShowBanner = function() {
					/**
					 * Allow a user to hide banner but reset after N days.
					 * @type {string}
					 */
				    var hide = CookieService.getHideBanner();
                    return !hide;
                }

			}]);
