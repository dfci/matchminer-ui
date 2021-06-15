'use strict';

angular.module('matchminerUiApp')
	.service('CookieService',
		['$cookies', '$log', 'ENV', function ($cookies, $log, ENV) {
			var _userDetails = null;

			this.setHideBanner = function() {
				var in_n_Days = new Date(new Date().getTime() + (ENV.bannerExpirationDays * 24 * 60 * 60 * 1000));
				return $cookies.put('hideBanner', true, {
					expires: in_n_Days
				});
			};

			this.getHideBanner = function() {
				return $cookies.get('hideBanner');
			}

			this.hasRequestToken = function () {
				return $cookies.get('token') != null;
			};

			this.getRequestToken = function () {
				return $cookies.get('token');
			};

			this.setRequestToken = function (token) {
				return $cookies.put("token", token);
			};

			this.removeRequestToken = function () {
				return $cookies.remove("token");
			};

			this.hasUserId = function () {
				return $cookies.get('user_id') != null;
			};

			this.getUserId = function () {
				return $cookies.get('user_id');
			};

			this.setUserId = function (userId) {
				return $cookies.put("user_id", userId);
			};

			this.removeUserId = function() {
				return $cookies.remove("user_id");
			};

			this.hasUserDetails = function () {
				return _userDetails != null;
			};

			this.getUserDetails = function () {
				return _userDetails;
			};

			this.parseCookies = function () {
				if (this.hasRequestToken()) {
					_userDetails = {};
					_userDetails.token = this.getRequestToken();
					_userDetails.userId = this.getUserId();
				}

				return _userDetails;
			}
		}]);
