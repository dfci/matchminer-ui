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

describe('Auth Provider Service', function () {
	var ENV,
		AuthServerProvider,
		$window;

	beforeEach(function () {
		module("matchminerUiApp");

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$state_, _AuthServerProvider_, _ENV_, _$window_) {
			$window = _$window_;
			ENV = _ENV_;
			AuthServerProvider = _AuthServerProvider_;
		});
	});

	it('should be able to login', function () {
		spyOn($window, 'open');

		AuthServerProvider.login();
		expect($window.open).toHaveBeenCalledWith(ENV.slsUrl, '_self');
	});

	it('should be able to logout', function () {
		spyOn($window, 'open');

		AuthServerProvider.logout();
		expect($window.open).toHaveBeenCalledWith(ENV.api.host + '?slo', '_self');
	});

});
