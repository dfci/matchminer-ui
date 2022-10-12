'use strict';

describe('Principal Service', function () {
	var scope,
		rootScope,
		state,
		Principal,
		PrincipalPromise,
		Account,
		AccountPromise,
		UserAccount,
		UserAccountMocks,
		CookieService,
		ENV,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		ENV = {
			samlAuthentication: true,
			devUser: false,
			userId: '1234567890abcdefgh'
		};

		Account = jasmine.createSpyObj('Account', [
			'get'
		]);

		CookieService = jasmine.createSpyObj('CookieService', [
			'removeUserId',
			'removeRequestToken',
			'getUserId',
			'hasRequestToken'
		]);

		module(function($provide) {
			$provide.value('Account', Account);
			$provide.value('CookieService', CookieService);
			$provide.value('ENV', ENV);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$state_, _$q_, _Principal_, _UserAccountMocks_) {
			rootScope = _$rootScope_;
			scope = _$rootScope_.$new();
			state = _$state_;
			Principal = _Principal_;
			UserAccountMocks = _UserAccountMocks_;
			UserAccount = UserAccountMocks.mockCtiAccount();
			$q = _$q_;

			/**
			 * Setup promises
			 */
			AccountPromise = $q.defer();
			PrincipalPromise = $q.defer();

			/**
			 * Define return values on function call
			 */
			Account.get.and.returnValue({ $promise: AccountPromise.promise });
			CookieService.getUserId.and.returnValue(ENV.userId);
			CookieService.hasRequestToken.and.returnValue(true);
		});
	});

	it('should be able to clear authentication', function() {
		Principal.clearAuthentication();

		expect(CookieService.removeUserId).toHaveBeenCalled();
		expect(CookieService.removeRequestToken).toHaveBeenCalled();

		expect(Principal.getIdentity()).toBeNull();
		expect(Principal.isAuthenticated()).toBeFalsy();
	});

	it('should be authenticate with set tokens / environment variables ', function() {
		var force = true;
		var identityPromise = Principal.identity(force);

		AccountPromise.resolve(UserAccount);
		scope.$digest();
		expect(Principal.getIdentity()).toEqual(UserAccount);
		expect(Principal.isAuthenticated()).toBeTruthy();

		identityPromise.then(function(acc) {
			expect(acc).toEqual(UserAccount);
		});
		scope.$digest();
	});

	it('should fail to authenticate with set tokens / environment variables.', function() {
		var force = true;
		var identityPromise = Principal.identity(force);

		var err = {
			error: true,
			errorMessage: 'Error occurred while fetching user account details'
		};

		AccountPromise.reject(err);
		scope.$digest();
		expect(Principal.getIdentity()).toBeNull();
		expect(Principal.isAuthenticated()).toBeFalsy();

		identityPromise.then(function(acc) {
			expect(acc).toBeNull();
		});
		scope.$digest();
	});

	it('should be able to fetch the identity', function () {
		var identity = Principal.getIdentity();
		expect(identity).toBeUndefined();
	});

	it('should be able to authenticate', function() {
		Principal.authenticate(UserAccount);
		expect(Principal.getIdentity()).toEqual(UserAccount);
		expect(Principal.isAuthenticated).toBeTruthy();
	});

	it('should be able to indicate if a user has an authority', function() {
		spyOn(Principal, 'identity');
		Principal.identity.and.returnValue(PrincipalPromise.promise);

		Principal.authenticate(UserAccount);

		var hasAuthority = Principal.hasAuthority('cti');
		PrincipalPromise.resolve(UserAccount);

		// Digest useraccount resolve
		scope.$digest();

		hasAuthority.then(function(val){
			expect(val).toBeTruthy();
		});

		// Digest returned identity promise
		scope.$digest();
	});

	it('should be able to indicate if a user has an authority', function() {
		spyOn(Principal, 'identity');
		Principal.identity.and.returnValue(PrincipalPromise.promise);

		Principal.authenticate(UserAccount);

		var hasAuthority = Principal.hasAuthority('admin');
		PrincipalPromise.resolve(UserAccount);

		// Digest useraccount resolve
		scope.$digest();

		hasAuthority.then(function(val){
			expect(val).toBeFalsy();
		});

		// Digest returned identity promise
		scope.$digest();
	});

	it('should return false when an error occurs in the resolve', function() {
		spyOn(Principal, 'identity');
		Principal.identity.and.returnValue(PrincipalPromise.promise);

		Principal.authenticate(UserAccount);

		var hasAuthority = Principal.hasAuthority('admin');
		var err = {
			error: true,
			errorMessage: 'An error occurred'
		};

		PrincipalPromise.reject(err);

		// Digest useraccount resolve
		scope.$digest();

		hasAuthority.then(function(val){
			expect(val).toBeFalsy();
		});

		// Digest returned identity promise
		scope.$digest();
	});

	it('should return false when testing for an authority and no identity is set', function() {
		var hasAuthority = Principal.hasAuthority();
		expect(hasAuthority).toBeFalsy();
	});

	it('should indicate whether the identity has any of the authorities', function() {
		var authorities = ['user', 'cti', 'admin'];
		Principal.authenticate(UserAccount);
		var hasOneOfAuthority = Principal.hasAnyAuthority(authorities);

		expect(hasOneOfAuthority).toBeTruthy();
	});

	it('should return false when no identity has been set when checking whether the identity has any of the authorities', function() {
		var authorities = ['user', 'cti', 'admin'];
		var hasOneOfAuthority = Principal.hasAnyAuthority(authorities);

		expect(hasOneOfAuthority).toBeFalsy();
	});

	it('should return false when no authorities have been argumented when checking the identity for any authorities', function() {
		Principal.authenticate(UserAccount);
		var hasOneOfAuthority = Principal.hasAnyAuthority([]);
		expect(hasOneOfAuthority).toBeFalsy();
	});
});
