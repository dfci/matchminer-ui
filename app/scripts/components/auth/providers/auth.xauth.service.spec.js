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
		var edu = ENV.devUser;
		ENV.devUser = null;

		AuthServerProvider.login();
		expect($window.open).toHaveBeenCalledWith(ENV.slsUrl, '_self');
		ENV.devUser = edu;
	});

	it('should be able to logout', function () {
		spyOn($window, 'open');
		var edu = ENV.devUser;
		ENV.devUser = null;
		AuthServerProvider.logout();
		expect($window.open).toHaveBeenCalledWith(ENV.api.host + '?slo', '_self');
		ENV.devUser = edu;
	});

});
