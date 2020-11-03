/**
 * Service for the genomic filters
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('FiltersService',
		['FiltersREST', 'MatchminerApiSanitizer', 'TokenHandler',
			function (FiltersREST, MatchminerApiSanitizer, tokenHandler) {
				var service = {};

				/**
				 * Fields used as metadata indicating pagination, sorting and max number of results
				 */
				var _TABLEOPTS = {
					max_results: 10,
					sort: '',
					page: 1
				};

				/**
				 * Fields to embed in the requested filters resource
				 */
				var _EMBEDDED = {
					FILTER_ID: 1,
					CLINICAL_ID: 1,
					VARIANTS: 1
				};

				/**
				 * Private methods
				 * Only exposed to service for unit tests
				 */
				var _buildSortString = function() {
					if (!service.tableOpts.sort) {
						return null;
					}

					var order = service.tableOpts.sort;
					var sortStr = order.charAt(0) == '-' ? order.substr(1) : order;
					var ascdesc = order.charAt(0) == '-' ? -1 : 1;
					return '[("' + sortStr + '", ' + ascdesc + ')]';
				};

				var _buildFilterQuery = function() {
					return {
						temporary: false,
						status: {
							"$in": [0, 1]
						},
						TEAM_ID: service.getTeamId()
					};
				};

				service = {
					isLoading: false,
					tableOpts: _TABLEOPTS,
					filters: [],
					filterOpts: {
						FILTER_STATUS: 1,
						MATCH_STATUS: 0,
						TEAM_ID: null
					},
					_buildSortString: _buildSortString,
					_buildFilterQuery: _buildFilterQuery
				};

				service.setTeamId = function(TEAM_ID) {
					this.filterOpts.TEAM_ID = TEAM_ID;
				};

				service.getTeamId = function() {
					return this.filterOpts.TEAM_ID;
				};

				service.getFilters = function() {
					return this.filters;
				};

				service.setFilters = function(filters) {
					this.filters = filters;
				};

				service.getTableOpts = function() {
					return this.tableOpts;
				};

				service.getSort = function() {
					return this.tableOpts.sort;
				};

				service.setSort = function(order) {
					this.tableOpts.sort = order;
				};

				service.getPage = function() {
					return this.tableOpts.page;
				};

				service.setPage = function(page) {
					this.tableOpts.page = page;
				};

				service.getPageSize = function() {
					return this.tableOpts.max_results;
				};

				service.setPageSize = function(max_results) {
					this.tableOpts.max_results = max_results;
				};

				service.getIsLoading = function() {
					return this.isLoading;
				};

				service.setIsLoading = function(isLoading) {
					this.isLoading = isLoading;
				};

				service.fetchFilters = function() {
					service.setIsLoading(true);

					var _filterQuery = service._buildFilterQuery();
					var _sort = service._buildSortString();

					return FiltersREST.findByQuery({
						where: angular.toJson(_filterQuery),
						embedded: angular.toJson(_EMBEDDED),
						sort: _sort,
						page: service.getPage(),
						max_results: service.getPageSize()
					}).$promise;
				};

				service.updateGenomicFilter = function(filter) {
					// Use the tokenHandler to set the etag which needs updating.
					tokenHandler.set(filter._etag);

					// Sanitize eve filter resource.
					var f = MatchminerApiSanitizer.sanitizeEveResource(angular.copy(filter), _EMBEDDED, false);

					return FiltersREST.updateGenomicFilter(f)
						.$promise;
				};

				return service;
			}
		]);
