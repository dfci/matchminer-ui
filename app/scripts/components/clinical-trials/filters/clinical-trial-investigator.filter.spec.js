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

describe('Principal Investigator Filter', function () {
	var principalInvestigatorFilter;

	beforeEach(module("matchminerUiApp"));

	beforeEach( inject(function (_$filter_) {
		var $filter = _$filter_;
		principalInvestigatorFilter = $filter('principalInvestigatorFilter');
	}));

	it('should return an empty string if no argument is given', function() {
		var filtered = principalInvestigatorFilter();
		expect(filtered).toBe("");
	});

	it('should return an a formatted string when a three part name is given', function() {
		var name = "Doe,Pappa,John";
		var filtered = principalInvestigatorFilter(name);
		expect(filtered).toBe('Doe, Pappa John');
	});

	it('should return an a formatted string when a two part name is given', function() {
		var name = "Doe,John";
		var filtered = principalInvestigatorFilter(name);
		expect(filtered).toBe('Doe, John');
	});
});
