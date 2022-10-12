'use strict';
/**
 * @Service UserAccountMocks
 * @Description Service layer exposing mock users
 */
angular.module('matchminerUiApp')
	.factory('UserAccountMocks',
		function () {
			var service = {};
			var baseAccount = {
				_created: "Thu, 01 Jan 1970 00:00:00 GMT",
				_id: "577cf6ef2b9920002cef0337",
				_links: {
					self: {
						href: "user/577cf6ef2b9920002cef0337",
						title: "User"
					}
				},
				_updated: "Thu, 01 Jan 1970 00:00:00 GMT",
				email: "test@example.com",
				first_name: "Bernd",
				last_auth: "Tue, 04 Oct 2016 05:12:09 GMT",
				last_name: "van der Veen",
				roles: [],
				teams: ["577cf6ef2b9920002e041cb3"],
				title: "testtitle",
				user_name: "testuser123"
			};

			service.mockCtiAccount = function() {
				var roles = ['cti'];
				return _.extend(baseAccount, {"roles" : roles });
			};

			service.mockAdminAccount = function() {
				var roles = ['admin'];
				return _.extend(baseAccount, {"roles" : roles });
			};

			service.mockUserAccount = function() {
				var roles = ['user'];
				return _.extend(baseAccount, {"roles" : roles });
			};

			return service;
		});

