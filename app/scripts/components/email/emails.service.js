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
