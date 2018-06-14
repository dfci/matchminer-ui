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
 * Service for the generic utilities required for showing notifications
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('ToastService',
		['$mdToast',
			function ($mdToast) {
				return {
					'success': function (msg, delay) {
						var d = delay || 5000;
						$mdToast.show(
							$mdToast.simple()
								.content(msg)
								.theme("success-toast")
								.position("top right")
								.hideDelay(d)
						);
					},
					'warn': function (msg, delay) {
						var d = delay || 5000;
						$mdToast.show(
							$mdToast.simple()
								.content(msg)
								.theme("warn-toast")
								.position("top right")
								.hideDelay(d)
						);
					},
					'info': function (msg, delay) {
						var d = delay || 5000;
						$mdToast.show(
							$mdToast.simple()
								.content(msg)
								.theme("neutral-toast")
								.position("top right")
								.hideDelay(d)
						);
					}
				}
			}
		]);

