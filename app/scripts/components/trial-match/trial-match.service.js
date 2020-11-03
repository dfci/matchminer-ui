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

				service.getTrialMatchesForPatient = function(clinical_id, vital_status, trial_status, sort) {
					if (clinical_id == undefined) {
						return $q.resolve([]);
					}

					var q = {
						where: {
							clinical_id: clinical_id,
							show_in_ui: true,
							is_disabled: false
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
							// trial curation level indicates whether the arm/step/dose for a match is suspended
							trial_curation_level_status: trial_status,
							trial_summary_status: trial_status

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
