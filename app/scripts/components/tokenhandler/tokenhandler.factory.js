'use strict';

angular.module('matchminerUiApp')
	.factory('TokenHandler', function () {
		var tokenHandler = {};
		var token = "none";

		tokenHandler.set = function (newToken) {
			token = newToken;
		};

		tokenHandler.get = function () {
			return token;
		};

		return tokenHandler;
	});
