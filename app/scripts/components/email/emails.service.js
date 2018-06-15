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

/**
 * Service for the genomic filters
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('EmailsService',
		['EmailsREST', 'MatchminerApiSanitizer', 'TokenHandler', 'ENV',
			function (EmailsREST, MatchminerApiSanitizer, tokenHandler, ENV) {
				var service = {};

				service.postEmail= function(email) {
					return EmailsREST.post({
                        email_address: email
					}).$promise;
				};

				return service;
			}
		]);
