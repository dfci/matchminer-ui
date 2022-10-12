/*
 * Session timeout controller
 * Logout the user when inactive for too long
 */
angular.module('matchminerUiApp')
	.controller('TimeoutController',
		['$scope', '$mdDialog', '$location', '$log', 'Auth',
			function ($scope, $mdDialog, $location, $log, Auth) {
				$log.debug("Init timeout controller");
				/*
				 * User has been idle for too long.
				 * Show timeout modal.
				 */
				$scope.$on('IdleStart', function () {
					$log.debug("User idle for too long");
					$mdDialog.show({
						templateUrl: 'scripts/components/session/timeout-dialog.html',
						parent: angular.element(document.body),
						clickOutsideToClose: true
					});
				});

				/*
				 * User came back from AFK
				 */
				$scope.$on('IdleEnd', function () {
					$log.debug("User came back");
					$mdDialog.hide();
				});

				/*
				 * User has been inactive for too long and timed out.
				 */
				$scope.$on('IdleTimeout', function () {
					$log.debug("User timed out. Logout and redirect.");
					$mdDialog.hide();
					Auth.logout();
				});

			}]);
