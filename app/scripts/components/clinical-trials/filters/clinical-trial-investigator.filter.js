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
 * Format a principal investigator string by splitting input by comma and returning
 * last_name, first_name middle_name;
 */
angular.module('matchminerUiApp')
	.filter('principalInvestigatorFilter', function() {
		return function(pi) {
		if (pi) {
			if (pi.contains(',')) {
				var piArr = pi.split(",");
				var name = "";

				if (piArr) {
					name = piArr[0] + ", " + piArr[1];
					if (!!piArr[2]) {
						name += " " + piArr[2];
					}
				}
				return name;
			} else {
				return pi
			}
		} else {
			return "";
		}
	}
});
