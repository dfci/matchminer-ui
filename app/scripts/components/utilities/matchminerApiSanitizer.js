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
	.factory('MatchminerApiSanitizer', ['$log', function ($log) {
		var sanitizer = {};

		// make sure the ES5 Array.isArray() method exists
		if (!Array.isArray) {
			Array.isArray = function (arg) {
				return Object.prototype.toString.call(arg) == '[object Array]';
			};
		}

		// removes meta fields and embedded objects are replaced with ID
		sanitizer.removeEmptyArrays = function (data) {
			for (var key in data) {
				var item = data[key];
				// see if this item is an array
				if (key[0] == '_' && key != "_id") {
					// remove this item from the parent object
					delete data[key];
					// if this item is an object, then recurse into it
					// to remove empty arrays in it too
				} else if (typeof item == "object") {
					sanitizer.removeEmptyArrays(item);
				}
			}

			return data;
		};

		sanitizer.sanitizeEveResource = function (data, embedded, isIntermediate) {
			for (var key in data) {
				var item = data[key];
				// see if this item is an array
				if (key[0] == '_' && key != "_id") {
					// remove this item from the parent object
					delete data[key];

					// if this is an embedded key and its value is an object
					// then it will be removed and replaced with the _id
				} else if (key in embedded) {

					// check if the value is an array.
					if (Array.isArray(item)) {
						var arrayLength = item.length;
						for (var i = 0; i < arrayLength; i++) {
							item[i] = item[i]['_id'];
						}

						// check if the value is embedded.
					} else if (typeof item == "object") {
						var cur_id = item['_id'];
						data[key] = cur_id;
					}

					// if this item is an object, then recurse into it
					// to remove empty arrays in it too
				} else if (typeof item == "object" && !isIntermediate) {
					sanitizer.sanitizeEveResource(item, embedded, isIntermediate);
				}
			}
			return data;
		};

		sanitizer.transformGenomicFilter = function (filter, toApi, fields) {
			$log.info("Starting transformation ", filter);

			// Iterate over all fields defined
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];

				/*
				 * Check if string
				 * Transform to UI array type
				 */

				if (angular.isString(filter.genomic_filter[field]) && !toApi) {
					var v = filter.genomic_filter[field];
					filter.genomic_filter[field] = [v];
					/*
					 * Check if array
					 * Transform from UI array type to a API valid object
					 */
				} else if (angular.isArray(filter.genomic_filter[field]) && toApi) {
					var v = filter.genomic_filter[field];
					filter.genomic_filter[field] = {};
					filter.genomic_filter[field]['^in'] = v;

				} else if (angular.isObject(filter.genomic_filter[field]) && !toApi) {
					/*
					 * Check if object
					 * Check if valid API object, if valid transform to UI compatible array
					 */
					$log.info(angular.isArray(filter.genomic_filter[field]));
					// Is mongo valid API object
					if ('^in' in filter.genomic_filter[field]) {
						var v = filter.genomic_filter[field]['^in'];
						filter.genomic_filter[field] = [];
						filter.genomic_filter[field] = v;
						$log.info("Transformed ^in array of object to array. ", filter.genomic_filter[field]);
					}
				}

				if (toApi
					&& !!filter.genomic_filter[field]
					&& filter.genomic_filter[field]['^in']
					&& filter.genomic_filter[field]['^in'].length == 0
					&& field != 'VARIANT_CATEGORY') {
					delete filter.genomic_filter[field];
				}

				if (!filter.genomic_filter.hasOwnProperty('TRUE_HUGO_SYMBOL')) {
					filter.genomic_filter.TRUE_HUGO_SYMBOL = [""];
				}

				$log.info("Transformed ", filter.genomic_filter[field]);
			}

			return filter;
		};

		return sanitizer;
	}]);
