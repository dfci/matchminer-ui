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

/**
 * @ngdoc function
 * @name matchminerUiApp.controller: ClinicalTrialsDetailsCtrl
 * @description
 * # ClinicalTrialsDetailsCtrl
 * Controller of the clinical trials details
 */
angular.module('matchminerUiApp')
	.controller('ClinicalTrialsDetailsCtrl',
		['$state', '$rootScope', '$scope', '$mdMedia', '$window', '$stateParams', 'ClinicalTrialsService', 'ENV', 'Mailto', 'TEMPLATES', '$log', '$timeout', '$q', 'TrialMatchService',
		function ($state, $rootScope, $scope, $mdMedia, $window, $stateParams, ClinicalTrialsService, ENV, Mailto, TEMPLATES, $log, $timeout, $q, TrialMatchService) {
			var ctd = this;
			var protocol_no = $stateParams.protocol_no;

			var _trialGreenStatusses = ['Open to Accrual'];
			var _trialGreyStatusses = ['New', 'On Hold', 'SRC Approval', 'IRB Initial Approval', 'Activation Coordinator Signoff'];
			var _trialYellowStatusses = ['Closed to Accrual', 'Suspended'];
			var _trialRedStatusses = ['IRB Study Closure', 'Terminated'];

			ctd.isLoading = true;
			ctd.isLargeMediaQuery = $mdMedia('gt-sm');
			ctd.scroll = 0;
			ctd.variant_table_options = {};
			ctd.variant_table_options.sort = "";
			ctd.variant_table_options.limit = 10;
			ctd.variant_table_options.page = 1;
			ctd.showMatchCriteria = {};
			ctd.isLoadingMatchCriteria = {};
			ctd.fromPatientDetails = $stateParams.patient_id != null;
			ctd.variantFilter = {
				query: '',
				options: {
					debounce: 500
				}
			};
			
			if (window.toPatientTrialMatchPage) {
				TrialMatchService.setSelectedProtocolNo(protocol_no);
			}

			ctd.removeVariantFilter = function() {
				ctd.variantFilter.query = '';
			};

			ctd.getAllSignatures = function() {
				var sigs = [];
				if (ctd.trial._summary.mutational_signatures != null && ctd.trial._summary.mutational_signatures.length > 0) {
					sigs = sigs.concat(ctd.trial._summary.mutational_signatures)
				}
				if (ctd.trial._summary.mmr_status != null && ctd.trial._summary.mmr_status.length > 0) {
					sigs = sigs.concat(ctd.trial._summary.mmr_status)
				}

				if (ctd.trial._summary.ms_status != null && ctd.trial._summary.ms_status.length > 0) {
					sigs = sigs.concat(ctd.trial._summary.ms_status)
				}
				return _.uniq(sigs, true);
			};
			
			ctd.filterGeneChips = function(genes) {
				if (genes && genes.length > 1) {
					return genes.filter(function(gene){return gene !== "None";})
				}
			    return genes;
			};
			
			ctd.variantsLength = function(variants) {
				return variants.filter(function(variant) {
					return variant.hugo_symbol && variant.hugo_symbol !== "None";
				}).length;
			};

			$scope.$watch(function() {
				return $mdMedia('gt-sm');
			}, function(nv) {
				ctd.isLargeMediaQuery = nv;
			});

			ctd.loadClinicalTrial = function(protocol_no) {

				ClinicalTrialsService.getTrial(protocol_no)
					.then(function (res) {
						if (res._items[0]) {
							var t = res._items[0];
							return $q.all([
									ClinicalTrialsService.getVariantsFromTreatmentStepList(t),
									ctd.getTrialCoordinator(t),
									ClinicalTrialsService.getSortedTreatmentStepList(t)
								])
								.spread(function (variants, studyCoordinator, treatment_steps) {
									ClinicalTrialsService.setTrial(res._items[0]);

									// Parsed variants defined in treatment criteria.
									ctd.variants = variants;

									// Lookup trial coordinator
									ctd.studyCoordinator = studyCoordinator;

									// Get sorted treatment steps
									ctd.treatment_steps = treatment_steps;
								}).catch(ctd._handleTrialParseError)
								.finally( function() {
									ctd.trial = res._items[0];
									$timeout(function() {
										ClinicalTrialsService.isDetailNavigation(true);
										ctd.isLoading = false;
									}, 1500);

								});
						} else {
							ctd.trialNotFound = protocol_no;
							ctd.isLoading = false;
						}
					});

			};

			/**
			 * Toggle criteria tree by level (STEP, ARM, DOSE) and code
			 *
			 */
			ctd.toggleCriteriaTree = function(level, code) {
				var levelArr = ctd.showMatchCriteria[level];

				// Not toggled before
				if (!levelArr) {
					levelArr = {};
					ctd.showMatchCriteria[level] = {};
				}

				// Not visible
				if (!levelArr.hasOwnProperty(code)) {
					if (!ctd.isLoadingMatchCriteria[level]) {
						ctd.isLoadingMatchCriteria[level] = {};
					}

					/**
					 * Use timeouts to help IE catch up with digest cycles and give it time to insert the criteria tree
					 * DOM elements.
					 */
					$timeout( function() {
						ctd.isLoadingMatchCriteria[level][code] = true;
					}, 50);

					// Add to showMatchCriteria
					$timeout( function() {
						ctd.showMatchCriteria[level][code] = true;
					}, 50);

					$timeout (function() {
						ctd.isLoadingMatchCriteria[level][code] = false;
					}, 250);
				} else {
					delete ctd.showMatchCriteria[level][code];
					ctd.isLoadingMatchCriteria[level][code] = false;
				}
			};

			ctd._handleTrialParseError = function(err) {
				$log.error("An error occurred while ", err)
			};

			ctd.visitOncoPro = function(protocol_id) {
				var path = ENV.resources.oncpro_base + protocol_id;
				window.open(path, '_blank');
			};

			ctd.visitCTgov = function(nct_id) {
				var path = ENV.resources.ctgov_base + nct_id;
				window.open(path, '_blank');
			};

			ctd.getIconForTrialStatus = function (status) {
				if (_trialGreenStatusses.indexOf(status) > -1) {
					return 'check';
				} else if (_trialGreyStatusses.indexOf(status) > -1) {
					return 'pause_circle_outline';
				} else if (_trialYellowStatusses.indexOf(status) > -1) {
					return 'warning';
				} else if (_trialRedStatusses.indexOf(status) > -1) {
					return 'stop';
				}
			};

			ctd.getTrialCoordinator = function(trial) {
				return ClinicalTrialsService.getTrialCoordinator(trial);
			};

			/**
			 * Email the study coordinator
			 */
			ctd.emailInvestigator = function(event, trial, coordinator_email) {
				return ClinicalTrialsService.emailCoordinator(event, trial, coordinator_email);
			};

			ctd.getStatusCss = function(trial) {
				var status = trial._summary.status[0].value;
				return {
					'ct-badge-status-green' : _trialGreenStatusses.indexOf(status) > -1,
					'ct-badge-status-grey' : _trialGreyStatusses.indexOf(status) > -1,
					'ct-badge-status-yellow' : _trialYellowStatusses.indexOf(status) > -1,
					'ct-badge-status-red' : _trialRedStatusses.indexOf(status) > -1,
					'md-fab md-raised md-mini ct-badge-fab dark' : !ctd.isLargeMediaQuery,
					'ct-badge ct-badge-details': ctd.isLargeMediaQuery
				};
			};

			ctd.gotoPreviousPage = function() {
				$state.go('patient', {'patient_id': $stateParams.patient_id, 'keep_search_filters': true});
			};

            /**
			 * When in EPIC restricted view, show button and allow user to navigate back to trial view
             */
			ctd.gotoClinicalTrials = function () {
                $state.go('clinicaltrials.overview')
			};

			// Initialize on load
			ctd.loadClinicalTrial(protocol_no);
		}]);
