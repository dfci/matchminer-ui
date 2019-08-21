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
 * Service for retrieving to manage the trials belonging to matches, i.e. trial_matches
 */
'use strict';

angular.module('matchminerUiApp')
	.factory('TrialMatchService',
		['TrialMatchREST', 'TrackingREST', '$log', '$q',
			function (TrialMatchREST, TrackingREST, $log, $q) {
				var service = {
					numberOfTrialMatches: null,
					sample_id: null,
					mrn: null,
					protocol_nos: null,
					selected_protocol_no: null
				};
				
				service.getProtocolNos = function() {
					return this.protocol_nos;
				};
				
				service.setProtocolNos = function(protocol_nos) {
					this.protocol_nos = protocol_nos;
					if (this.mrn && this.protocol_nos) {
						this.postTrialMatches();
					}
				};
				
				service.getMRN = function() {
					return this.mrn;
				};
				
				service.setMRN = function(mrn) {
					this.mrn = mrn;
					if (this.mrn && this.protocol_nos) {
						this.postTrialMatches();
					}
				};
				
				service.postTrialMatches = function() {
					var matches = this.protocol_nos;
					var mrn = this.mrn;
					matches.forEach(function(match){
						var q = {
							'protocol_no': match,
							'mrn': mrn,
							'from_details': false
						};
						TrackingREST.queryTrialMatchesTracking(q).$promise
							.then(function (res) {
							})
							.catch( function(err){
								$log.warn("Error in tracking metrics ", err);
							})
					});
				};
				
				service.setSelectedProtocolNo = function(selected_protocol_no) {
					this.selected_protocol_no = selected_protocol_no;
					if (this.mrn && this.selected_protocol_no) {
						this.postSelectedTrialMatch();
					}
				};
				
				service.postSelectedTrialMatch = function () {
					var match = this.selected_protocol_no;
					var mrn = this.mrn;
					var q = {
						'protocol_no': match,
						'mrn': mrn,
						'from_details': true
					};
					
					TrackingREST.querySelectedTrialMatchTracking(q).$promise
						.then(function (res) {
						})
						.catch( function(err){
							$log.warn("Error in tracking metrics ", err);
						})
				};
				
				service.resetTrialMatches = function() {
					this.mrn = null;
					this.protocol_nos = null;
				};
				
				service.resetSelectedTrialMatch = function () {
					this.selected_protocol_no = null;
				};

				service.getTrialMatchesForPatient = function(mrn, vital_status, trial_status, sample_id, sort) {
					if (mrn == undefined) {
						return $q.resolve([]);
					}

					var q = {
						where: {
							mrn: mrn,
							show_in_ui: true
						}
					};
					
					if (sort) {
						_.extend(q, {
							sort: sort
						});
					}
					
					if (vital_status) {
						_.extend(q.where, {
							vital_status: vital_status
						});
					}

					if (trial_status) {
						_.extend(q.where, {
							trial_curation_level_status: trial_status
						});
					}

					if (sample_id) {
						_.extend(q.where, {
							sample_id: sample_id
						});
					}

					return TrialMatchREST.query(q).$promise;
				};

				service.getNumberOfTrialMatches = function() {
					return this.numberOfTrialMatches;
				};

				service.setNumberOfTrialMatches = function(numberOfTrialMatches) {
					this.numberOfTrialMatches = numberOfTrialMatches;
				};

				service.getSampleId= function() {
					return this.sample_id ;
				};

				service.setSampleId = function(sample_id) {
					this.sample_id = sample_id;
				};

				service.isCurrentSampleId = function(sample_id) {
					return this.sample_id == sample_id ;
				};

				return service;
			}
		]);
