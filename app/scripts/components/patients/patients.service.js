/**
 * Service for the patient data resource accessors
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('PatientsService',
		['PatientsREST', '$log', '$q',
			function (PatientsREST, $log, $q) {

				var _metadata = {};
				_metadata.total_elements = 0;
				_metadata.current_page = 1;
				_metadata.page_size = 10;

				var service = {
					metadata: _metadata,
					isLoading: false,
					patients: [],
					lastSearch: null
				};

				/**
				 * Helper functions
				 */
				var escapeRegExp = function(str) {
					return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
				};

				/**
				 * Returns the available metadata object.
				 * @returns {{}} object containing the query metadata.
				 */
				service.getMetadata = function () {
					return this.metadata;
				};

				service.setMetadata = function (metadata) {
					this.metadata = metadata;
				};

				service.setPageSize = function(size) {
					this.metadata.page_size = size;
				};

				service.setPage = function(page) {
					this.metadata.current_page = page;
				};

				/**
				 *
				 * @returns {*}
				 */
				service.searchPatients = function() {
					var deferred = $q.defer();

					var searchTerm = service.getSearchTerm();
					if (!searchTerm) {
						this.patients = [];
						return deferred.reject();
					}

					service.isLoading = true;

					var re = /,/gi;
					var st = searchTerm.replace(re, '');

					var q = { 'MRN': { '$regex': '^' + escapeRegExp(st) }};

					PatientsREST.queryClinicalSearch({
						where: angular.toJson(q)
					}).$promise
						.then(function (res) {
							var rawPatients = _.map(res._items, function(p) {
								return p;
							});
							service.last_search = searchTerm;
							service.patients = _.groupBy(rawPatients, 'MRN');

							service.isLoading = false;
							deferred.resolve(service.patients);
						})
						.catch( function(err){
							$log.warn("Error in patient search ", err);
							service.isLoading = false;
							deferred.reject(err);
						});

					return deferred.promise;
				};

				service.getResults = function() {
					return this.patients;
				};

				service.setResults = function(patients) {
					this.patients = patients;
				};

				service.getLastSearchTerm = function() {
					return this.last_search;
				};

				service.queryPatient = function(id) {
					return PatientsREST.queryClinical({id: id}).$promise;
				};

				service.getSearchTerm = function() {
					return this.searchTerm;
				};

				service.setSearchTerm = function(searchterm) {
					this.searchTerm = searchterm;
				};

				service.clearSearch = function() {
					this.patients = null;
					this.searchTerm = null;
                    this.last_search = null;
				};

				return service;
			}
		]);

