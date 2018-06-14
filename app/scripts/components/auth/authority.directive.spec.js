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

describe('Authority directive', function () {
	var scope,
		rootScope,
		compile,
		state,
		Auth,
		Principal,
		PrincipalPromise,
		$q;

	beforeEach(function () {
		module("matchminerUiApp");

		Principal = jasmine.createSpyObj('Principal', [
			'hasAuthority',
			'hasAnyAuthority'
		]);

		module(function($provide) {
			$provide.value('Principal', Principal);
		});

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$compile_, _$q_) {
			rootScope = _$rootScope_;
			compile = _$compile_;
			scope = _$rootScope_.$new();
			$q = _$q_;

			PrincipalPromise = $q.defer();
			Principal.hasAuthority.and.returnValue(PrincipalPromise.promise);
		});
	});

	function getCompiledHasAuthorityElement() {
		var element = angular.element('<div has-authority="cti"></div>');
		var compiledElement = compile(element)(scope);
		scope.$digest();
		return compiledElement;
	}

	function getCompiledHasAnyAuthorityElement() {
		var element = angular.element('<div has-any-authority="cti, admin"></div>');
		var compiledElement = compile(element)(scope);
		scope.$digest();
		return compiledElement;
	}

	it('should remove the css class hidden when the user has the correct authority', function() {
		var elm = getCompiledHasAuthorityElement();

		PrincipalPromise.resolve(true);
		scope.$digest();

		expect(elm.hasClass('hidden')).toBeFalsy();
	});

	it('should add the css class hidden when the user doesn\'t have the correct authority', function() {
		var elm = getCompiledHasAuthorityElement();

		PrincipalPromise.resolve();
		scope.$digest();

		expect(elm.hasClass('hidden')).toBeTruthy();
	});

	it('should add the css class hidden when the user doesn\'t have one of the correct authorities', function() {
		Principal.hasAnyAuthority.and.returnValue(false);
		var elm = getCompiledHasAnyAuthorityElement();
		scope.$digest();

		expect(elm.hasClass('hidden')).toBeTruthy();
	});

	it('should remove the css class hidden when the user has one of the correct authorities', function() {
		Principal.hasAnyAuthority.and.returnValue(true);
		var elm = getCompiledHasAnyAuthorityElement();
		scope.$digest();

		expect(elm.hasClass('hidden')).toBeFalsy();
	});

});
