'use strict';

describe('Request Interceptor tests', function () {
	var ENV,
		requestInterceptor,
		CookieService;

	beforeEach(function () {
		module("matchminerUiApp");

		inject(function (_$controller_, _$rootScope_, _ENV_, _requestInterceptor_, _CookieService_) {
			ENV = _ENV_;
			requestInterceptor = _requestInterceptor_;
			CookieService = _CookieService_;
		});
	});

	it('should remove authorization property in header when making request to ES server.', function() {
		var config = {
			url: ENV.elasticsearch.proxy + '/_search/',
			headers: {
				Authorization: 'Basic 1234567890abcdefg'
			}
		};

		var interceptedConfig = requestInterceptor.request(config);
		expect(interceptedConfig.headers['Authorization']).toBeUndefined();
	});

	it('should set the CookieService token and userId for a dev user.', function() {
		var config = {
			url: 'http://localhost.com/request/',
			headers: {
				Authorization: 'Basic 1234567890abcdefg'
			}
		};

		spyOn(CookieService, 'setRequestToken');
		spyOn(CookieService, 'setUserId');

		requestInterceptor.request(config);

		expect(CookieService.setRequestToken).toHaveBeenCalledWith(ENV.devUser.token);
		expect(CookieService.setUserId).toHaveBeenCalledWith(ENV.devUser.user_id);
	});

	it('should return the config on a request error', function (){
		var config = {
			url: 'http://localhost.com/request/',
			headers: {
				Authorization: 'Basic 1234567890abcdefg'
			}
		};

		var retConfig = requestInterceptor.requestError(config);
		expect(retConfig).toEqual(config);
	});
});
