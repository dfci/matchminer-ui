/**
 * Filter to test for the existence and exclusion of negating fields for clinical trial badges.
 * Works for arrays of objects, in this case a 'field' argument is required, and it works for arrays of strings.
 *
 * Example: When an array holds both 'Breast' and '!Breast' the negated field will be left out of the array.
 */
angular.module('matchminerUiApp')
	.filter('trialBadgeFilter', function() {
	return function(array, field) {
		var out = [];
		_.each(array, function(v) {
			var found = false;
			var f = !field ? v : v[field];
			if (f.charAt(0) != '!') {
				found = true;
			} else {
				if (field) {
					/**
					 * Check if the argumented array holds a non negating counterpart for a negating value.
					 * i.e. '!Breast' is also present in the form of 'Breast'
					 * If its not return true.
					 */
					return !_.some(array, function(e) {
						return e[field] == f.substr(1);
					});
				} else {
					if (array.indexOf(v.substr(1)) == -1) {
						found = true;
					}
				}
			}

			if(found) {
				out.push(v);
			}
		});

		return out;
	}
	})
	/**
	 * Calculate an object intersect with an array as input and a target array containing objects
	 * by checking for the intersect of the object id's.
	 *
	 * Takes an additional boolean argument if the intersect should be negated
	 * Returns: [Array]
	 */
	.filter('objectIntersectById', function() {
		return function (array, intersectsWith, isNegate) {
			var wt = _.map(intersectsWith, function(o) {
				return o.id;
			});

			return _.filter(array, function(item, idx) {
				return isNegate ? !_.contains(wt, item.id) : _.contains(wt, item.id);
			});
		}
	});
