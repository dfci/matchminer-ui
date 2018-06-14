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

describe('Various utilities function and filters', function () {
	var scope,
		filter;

	beforeEach(function () {
		module("matchminerUiApp");

		// Don't need to inject state or stateparams here
		inject(function (_$controller_, _$rootScope_, _$filter_) {
			scope = _$rootScope_.$new();
			filter = _$filter_;
		});
	});

	it('should be able to capitalize a string', function () {
		var capitalizeFilter = filter('capitalize');

		var lc_string = "john doe";
		var cap_string = capitalizeFilter(lc_string);
		expect(cap_string).toEqual('John doe');
	});

	it('should return an empty string when input is null', function() {
		var capitalizeFilter = filter('capitalize');
		var empty_string = capitalizeFilter();
		expect(empty_string).toEqual('');
	});

	it('should be able to parse a date ', function() {
		var date_string = 'Fri Mar 25 2015 09:56:24 GMT+0100';
		var parseDateFilter = filter('parsedate');
		var date = parseDateFilter(date_string);
		expect(date).toBe(1427273784000);
	});

	it('should return an empty string when parsing a null date ', function() {
		var date_string = null;
		var parseDateFilter = filter('parsedate');
		var date = parseDateFilter(date_string);
		expect(date).toBe('');
	});

	it('should be able to format an underscore formatted string ', function() {
		var string = 'test_string_underscore_formatted';
		var usFilter = filter('formatUnderscoreString');
		var transformed = usFilter(string);
		expect(transformed).toBe('test string underscore formatted');
	});

	it('should return an empty string when formatting null underscore formatted string ', function() {
		var string = null;
		var usFilter = filter('formatUnderscoreString');
		var transformed = usFilter(string);
		expect(transformed).toBe('');
	});

	it('should be able to transform a negating field ', function() {
		var negatingString = '!BRCA';
		var transformNegation = filter('transformNegation');
		var transformed = transformNegation(negatingString);
		expect(transformed).toBe('NO BRCA');
	});

	it('should return an empty string when formatting null negating field ', function() {
		var string = null;
		var transformNegation = filter('transformNegation');
		var transformed = transformNegation(string);
		expect(transformed).toBe('');
	});

	it('should return the normal string when value is non negating', function() {
		var string = 'BRCA';
		var transformNegation = filter('transformNegation');
		var transformed = transformNegation(string);
		expect(transformed).toBe('BRCA');
	});

	it('should be able to parse and transform comments', function() {
		var string = '/break//break/testheader:/break/this is a paragraph of text./break//break/header2:/break/This is the second paragraph.';
		var parseComments = filter('parsecomments');

		var parsedComments = parseComments(string);
		var expectedComments = ['<h3 class=\'lead report-comment-header\'></h3><p></p>', '<h3 class=\'lead report-comment-header\'>testheader</h3><p>this is a paragraph of text.</p>', '<h3 class=\'lead report-comment-header\'>header2</h3><p>This is the second paragraph.</p>'];
		expect(parsedComments).toEqual(expectedComments);

	});
});
