'use strict';

describe('Auth Service', function () {
	var scope,
		rootScope,
		state,
		Auth,
		AuthServerProvider,
		AuthServerProviderPromise,
		Principal,
		PrincipalPromise,
		UserAccount,
		UserAccountMocks,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		AuthServerProvider = jasmine.createSpyObj('AuthServerProvider', [
			'login',
			'logout'
		]);

		Principal = jasmine.createSpyObj('Principal', [
			'identity',
			'authenticate',
			'isAuthenticated',
			'hasAnyAuthority',
			'isIdentityResolved'
		]);

		module(function($provide) {
			$provide.value('AuthServerProvider', AuthServerProvider);
			$provide.value('Principal', Principal);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$state_, _$q_, _Auth_, _Principal_, _UserAccountMocks_) {
			rootScope = _$rootScope_;
			scope = _$rootScope_.$new();
			state = _$state_;
			Auth = _Auth_;
			Principal = _Principal_;
			UserAccountMocks = _UserAccountMocks_;
			UserAccount = UserAccountMocks.mockCtiAccount();
			$q = _$q_;

			rootScope.toState = {
				data: {
					authorities: ['cti', 'admin']
				}
			};

			/**
			 * Setup promises
			 */
			AuthServerProviderPromise = $q.defer();
			PrincipalPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			AuthServerProvider.login.and.returnValue(AuthServerProviderPromise.promise);
			Principal.identity.and.returnValue(PrincipalPromise.promise);
			Principal.hasAnyAuthority.and.returnValue(false);
			Principal.isIdentityResolved.and.returnValue(true);
		});
	});

	it('should be able to login', function () {
		var authPromise = Auth.login();

		AuthServerProviderPromise.resolve({});
		scope.$digest();

		expect(Principal.identity).toHaveBeenCalledWith(true);
		scope.$digest();

		PrincipalPromise.resolve(UserAccount);

		authPromise.then( function(ua) {
			expect(ua).toEqual(UserAccount);
		});
		scope.$digest();
	});

	it('should fail to login', function () {
		spyOn(Auth, 'logout').and.callThrough();
		var authPromise = Auth.login();

		AuthServerProviderPromise.reject({'error': true});
		scope.$digest();

		expect(Auth.logout).toHaveBeenCalled();
		authPromise.catch( function(err) {
			expect(err).toEqual({'error': true});
		});

		scope.$digest();
	});

	it('should be able to authorize the principal authority missing the correct authorities', function() {
		spyOn(state, 'go');
		var force = true;

		Principal.isAuthenticated.and.returnValue(true);
		Auth.authorize(force);

		PrincipalPromise.resolve(UserAccount);
		scope.$digest();

		var errorMsg = {
			error: true,
			errorMessage: 'You are currently not authorized to access this page.',
			errorDetails: 'If you believe this is incorrect, please contact the developers.'
		};

		expect(state.go).toHaveBeenCalledWith('home', errorMsg);
	});

	// it('should be able to authorize the principal authority when not logged in', function() {
	// 	spyOn(state, 'go');
	// 	var force = true;
    //
	// 	Principal.isAuthenticated.and.returnValue(false);
	// 	Auth.authorize(force);
    //
	// 	PrincipalPromise.resolve(UserAccount);
	// 	scope.$digest();
    //
	// 	expect(state.go).toHaveBeenCalledWith('home');
	// });

	it('should redirect the dashboard when logged in', function() {
		spyOn(state, 'go');
		var force = true;

		rootScope.toState = {
			name: 'home',
			data: {
				authorities: []
			}
		};

		rootScope.toStateParams = {};

		Principal.isAuthenticated.and.returnValue(true);
		Auth.authorize(force);

		PrincipalPromise.resolve(UserAccount);
		scope.$digest();

		expect(state.go).toHaveBeenCalledWith('dashboard');
	});
});
