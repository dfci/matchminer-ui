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

describe('Timeout Controller', function () {
	var scope,
		ctrl,
		mdDialog,
		Auth;

	beforeEach(function () {
		module("matchminerUiApp");

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$mdDialog_, _Auth_) {
			scope = _$rootScope_.$new();
			mdDialog = _$mdDialog_;
			Auth = _Auth_;

			// Pass your mock stateparams object to the controller
			ctrl = _$controller_("TimeoutController", { $scope: scope });
		});
	});

	it('should listen to IdleStart event', function () {
		spyOn(mdDialog, 'show');
		scope.$broadcast('IdleStart');

		var opts = {
			templateUrl: 'scripts/components/session/timeout-dialog.html',
			parent: angular.element(document.body),
			clickOutsideToClose: true
		};

		expect(mdDialog.show).toHaveBeenCalledWith(opts);
	});

	it('should listen to IdleTimeout event', function () {
		spyOn(mdDialog, 'hide');
		spyOn(Auth, 'logout');
		scope.$broadcast('IdleTimeout');

		expect(mdDialog.hide).toHaveBeenCalled();
		expect(Auth.logout).toHaveBeenCalled();
	});

	it('should listen to the IdleEnd event', function() {
		spyOn(mdDialog, 'hide');
		scope.$broadcast('IdleEnd');
		expect(mdDialog.hide).toHaveBeenCalled();
	});

});
