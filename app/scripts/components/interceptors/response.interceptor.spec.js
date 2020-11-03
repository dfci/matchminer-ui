'use strict';

describe('Response Interceptor tests', function () {
	var ENV,
		responseInterceptor,
		$state,
		Principal,
		$q,
		$mdToast,
		$window;

	beforeEach(function () {
		module("matchminerUiApp");

		inject(function (_$controller_, _$rootScope_, _ENV_, _$window_, _responseInterceptor_, _$state_, _$q_, _Principal_, _$mdToast_) {
			$window = _$window_;
			ENV = _ENV_;
			$state = _$state_;
			$mdToast = _$mdToast_;
			$q = _$q_;
			Principal = _Principal_;
			responseInterceptor = _responseInterceptor_;
		});
	});

	/**
	 * Cases to test
	 * - -1 - Cannot connect to the API
	 * - 308 - Requires elevation
	 * - 401 - Unauthorized
	 * - 404 - Page not found
	 * - 412 - Missing etag
	 * - 422 - Data malformed
	 * - 497 - Unauthorized
	 * - 500 - Internal Server Error
	 */

	// -1 Cannot connect to the API
	it('should redirect to the frontpage with an error message when unable to connect to API', function() {
		var response = {
			status: -1,
			config: {}
		};

		spyOn($state, 'go');

		responseInterceptor.responseError(response);
		var expectedErr = {
			'error': true,
			'errorMessage': 'Cannot connect to the server.',
			'errorDetails': 'Please contact the developers.'
		};

		expect($state.go).toHaveBeenCalledWith('home', expectedErr);
	});

	// 308 Requires elevations
	it('should redirect to the frontpage when a user is not authorized to access MatchMiner', function() {
		var response = {
			status: 308,
			config: {}
		};

		spyOn($state, 'go');

		responseInterceptor.responseError(response);
		var expectedErr = {
			'error': true,
			'errorMessage': 'You are currently not authorized to access MatchMiner.',
			'errorDetails': 'If you have questions, please send an email to '+ ENV.resources.email +'.'
		};

		expect($state.go).toHaveBeenCalledWith('home', expectedErr);
	});

	// 401 Unauthorized
	it('should redirect to the frontpage and clear authentication when a user is not authorized for a specific action', function() {
		var response = {
			status: 401,
			config: {}
		};

		spyOn($state, 'go');
		spyOn(Principal, 'clearAuthentication');

		responseInterceptor.responseError(response);

		expect(Principal.clearAuthentication).toHaveBeenCalled();
		expect($state.go).toHaveBeenCalledWith('home');
	});

	// 404 Page not found
	it('should redirect to the frontpage and show an error message when a page is not found', function() {
		var response = {
			status: 404,
			config: {}
		};

		spyOn($state, 'go');

		responseInterceptor.responseError(response);
		var expectedErr = {
			'error': true,
			'errorMessage': 'Page not found. The following link could not be resolved by MatchMiner. We\'re sorry!'
		};

		expect($state.go).toHaveBeenCalledWith('home', expectedErr);
	});

	// 412 Missing etag
	it('should inform the user with an error message that the etag is missing', function() {
		var response = {
			status: 412,
			config: {}
		};

		spyOn($mdToast, 'show');

		responseInterceptor.responseError(response);
		expect($mdToast.show).toHaveBeenCalled();
	});

	// 422 Malformed document
	it('should inform the user with an error message that the resource document is malformed.', function() {
		var response = {
			status: 422,
			config: {}
		};

		spyOn($mdToast, 'show');

		responseInterceptor.responseError(response);
		expect($mdToast.show).toHaveBeenCalled();
	});

	// 497 Unauthorized for action
	it('should redirect the user that the requested action is unauthorized.', function() {
		var response = {
			status: 497,
			config: {}
		};

		spyOn($state, 'go');
		spyOn(Principal, 'clearAuthentication');

		responseInterceptor.responseError(response);

		expect(Principal.clearAuthentication).toHaveBeenCalled();
		expect($state.go).toHaveBeenCalledWith('home');
	});

	// 500 Internal server error
	it('should redirect to the homepage and inform the user that a internal server error has occurred.', function() {
		var response = {
			status: 500,
			config: {}
		};

		spyOn($state, 'go');

		responseInterceptor.responseError(response);
		var expectedErr = {
			'error': true,
			'errorMessage': 'Internal server error.',
			'errorDetails': 'Please contact the developers at <a href="mailto:'+ ENV.resources.email +'">'+ ENV.resources.email +'</a>'
		};

		expect($state.go).toHaveBeenCalledWith('home', expectedErr);
	});
});
