/**
 * Options Service
 */
angular.module('matchminerUiApp')
	.factory('Options',
		function () {
			return {
				'genomicAlterations': {
					'MUT': {
						name: 'Mutation',
						variant_category: 'MUTATION',
						cnv_call: null,
						is_available: true
					},
					'HA': {
						name: 'High level amplification',
						variant_category: 'CNV',
						cnv_call: 'High level amplification',
						is_available: true
					},
					'Gain': {
						name: 'Gain',
						variant_category: 'CNV',
						cnv_call: 'Gain',
						is_available: true
					},
					'2DEL': {
						name: 'Homozygous deletion',
						variant_category: 'CNV',
						cnv_call: 'Homozygous deletion',
						is_available: true
					},
					'TRL': {
						name: 'Structural Rearrangement',
						variant_category: 'SV',
						cnv_call: null,
						is_available: true
					}
				},
				'genders': {
					'null': 'All',
					'Male': 'Male',
					'Female': 'Female'
				},
				'cancerTypes': {
					'ALL': 'All Cancer Types',
					'_SOLID_': 'Solid Cancer Types',
					'_LIQUID_': 'Liquid Cancer Types',
					'_SPECIFIC_': 'Specific Cancer Type'
				},
				'dateComparators': {
					'all': 'All',
					'$lte': 'Before',
					'$gte': 'After'
				}
			}
		});
