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

angular.module('matchminerUiApp')
	.directive('hasAnyAuthority', ['Principal', function (Principal) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var setVisible = function () {
						element.removeClass('hidden');
					},

					authorities = attrs.hasAnyAuthority.replace(/\s+/g, '').split(','),

					setHidden = function () {
						element.addClass('hidden');
					},
					defineVisibility = function (reset) {
						var result;
						if (reset) {
							setVisible();
						}

						result = Principal.hasAnyAuthority(authorities);
						if (result) {
							setVisible();
						} else {
							setHidden();
						}
					};

				if (authorities.length > 0) {
					defineVisibility(true);
				}
			}
		};
	}])
	.directive('hasAuthority', ['Principal', function (Principal) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var setVisible = function () {
						element.removeClass('hidden');
					},
					setHidden = function () {
						element.addClass('hidden');
					},

					authority = attrs.hasAuthority.replace(/\s+/g, ''),

					defineVisibility = function (reset) {

						if (reset) {
							setVisible();
						}

						Principal.hasAuthority(authority)
							.then(function (result) {
								if (result) {
									setVisible();
								} else {
									setHidden();
								}
							});
					};

				if (authority.length > 0) {
					defineVisibility(true);
				}
			}
		};
	}]);
