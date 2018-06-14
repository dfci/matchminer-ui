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

describe('ElasticSearch REST Unit Tests', function () {
	// Setup
	var ElasticSearchREST,
		$httpBackend,
		$q,
		ENV;

	beforeEach(function () {
		module('matchminerUiApp');
	});

	beforeEach(inject(function (_ElasticSearchREST_, _$httpBackend_, _ENV_, _$q_) {
			ElasticSearchREST = _ElasticSearchREST_;
			$httpBackend = _$httpBackend_;
			ENV = _ENV_;
			$q = _$q_;
		})
	);

	describe('Resource tests', function () {
		it('should have a defined service', function () {
		    expect(ElasticSearchREST).not.toBe(null);
		});

		 it('should be able to find trials by Id', function() {
			 var url = ENV.elasticsearch.proxy + '/' + ENV.elasticsearch.index + '/trial/_search';
			 var q = {
				 'where': {
					 'id': '12-123'
				 }
			 };

			 spyOn(ElasticSearchREST, 'findTrialsBy').and.callFake(function (input) {
				 var deferred = $q.defer();
				 deferred.resolve({
					 'resultData': 'Resolved REST FindTrialsBy ',
					 'payload': input
				 });
				 return deferred.promise;
			 });

			 ElasticSearchREST.findTrialsBy(q);
			 $httpBackend.whenPOST(url, q);

			 expect(ElasticSearchREST.findTrialsBy).toHaveBeenCalledWith(q);
		 });
	});

});
