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
 * @name matchminerUiApp.controller:FilterEditorCtrl
 * @description
 * # FilterEditorCtrl
 * Filter Editor Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('FilterEditorCtrl',
		['$state', '$rootScope', '$document', '$q', '$stateParams', '$timeout',
			'AutocompleteService', 'FiltersREST', 'ToastService', 'UtilitiesService',
			'$mdDialog', 'Options', 'MatchminerApiSanitizer', 'TokenHandler',
			'$log', '_', 'GraphService', 'ENV', 'UserAccount', 'moment',
			function ($state, $rootScope, $document, $q, $stateParams, $timeout,
			          AutocompleteService, FiltersREST, ToastService, UtilitiesService,
			          $mdDialog, Options, MatchminerApiSanitizer, tokenHandler,
			          $log, _, GraphService, ENV, UserAccount, moment
			) {
				var vm = this;

				// Define cancertype constants
				var CANCERTYPE_SPECIFIC = '_SPECIFIC_';
				var CANCERTYPE_LIQUID = '_LIQUID_';
				var CANCERTYPE_SOLID = '_SOLID_';

				// Set options to be available
				vm.minDate = new Date('2011', '01', '01');
				vm.maxDate = new Date('2025', '01', '01');
				vm.cancerTypes = Options.cancerTypes;
				vm.genders = Options.genders;
				vm.genomicAlterations = Options.genomicAlterations;
				vm.cnvSvAlterations = ['HA', 'Gain', '2DEL', 'TRL'];

				// Color picker options
				vm.colorpickerOptions = {
					swatchBootstrap: true,
					swatchOnly: true,
					swatch: true,
					alpha: false,
					format: "rgb"
				};

				// MD form value variables
				vm.selectedCancerTypeCategory = null;
				vm.selectedCancerType = null;

				// Set user
				vm._teamId = UserAccount.teams[0];
				vm._userId = UserAccount._id;

				//Preloaded data for autocomplete
				vm.geneSymbols = [];
				vm.oncotreeData = [];
				vm.isGeneSelected= false;

                vm.loadingIntermediate = false;

                vm.filterQuery = {};
                vm.filterQuery.status = '-';
                $rootScope.isReset = false;

                vm.selectedMutationalSignature = '';

                // NOTE: 'Tobacco Status' is spelled wrong in the API as of 2/18
                vm.signatures =  [
                    {
                        id: 1,
                        name: 'MMR-Proficient',
                        key: 'MMR_STATUS',
                        value: 'Proficient (MMR-P / MSS)'
                    },
                    {
                        id: 2,
                        name: 'MMR-Deficient',
                        key: 'MMR_STATUS',
                        value: 'Deficient (MMR-D / MSI-H)'
                    },
                    {
                        id: 3,
                        name : 'Tobacco',
                        key: 'TABACCO_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 4,
                        name: 'TMZ',
                        key: 'TEMOZOLOMIDE_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 5,
                        name: 'PolE',
                        key: 'POLE_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 6,
                        name: 'APOBEC',
                        key: 'APOBEC_STATUS',
                        value: 'Yes'
                    },
                    {
                        id: 7,
                        name: 'UVA',
                        key: 'UVA_STATUS',
                        value: 'Yes'
                    }
                ];

                vm.isMutationalSignatureSelected = false;

                /**
                 * Search for mutational signatures
                 */
                vm.querySignatures = function querySignatures (query) {
                	if(!query) return;
                	query = query.toUpperCase();
                    var results = query ? vm.signatures.filter( vm.createFilterFor(query) ) : vm.signatures,
                        deferred;
                    return results;
                };

                vm.createFilterFor = function createFilterFor(query) {
                    return function filterFn(signature) {
                        return (signature.name.toUpperCase().indexOf(query) === 0);
                    };
                };

                /**
                 * Set genomic filter value for mutational signature. Do not allow user to select a mutational signature if genes are selected
                 * @param signature
                 */
                vm.selectedSignatureChange = function selectedSignatureChange(signature) {
                	//Make sure no genes are selected
                	if (vm.filter.genomic_filter.TRUE_HUGO_SYMBOL[0] === '' || vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.length === 0 && signature !== null) {
                        // Reset/remove gene symbols
                        vm.filter.genomic_filter.TRUE_HUGO_SYMBOL = [];

                        //Add selected option to object to send to backend
                        if (!vm.filter.genomic_filter.hasOwnProperty(signature.key)
                            || (vm.filter.genomic_filter.hasOwnProperty(signature.key) && (signature.value !== vm.filter.genomic_filter[signature.key]))) {
                            vm.filter.genomic_filter.VARIANT_CATEGORY = ['SIGNATURE'];
                            vm.isMutationalSignatureSelected = true;
                            vm.filter.genomic_filter[signature.key] = signature.value;
                        } else if (vm.filter.genomic_filter[signature.key] === signature.value) {
                            vm.filter.genomic_filter.VARIANT_CATEGORY = ['MUTATION'];
                            delete vm.filter.genomic_filter[signature.key];
                        }

                        vm.fetchIntermediateFilterResults(vm.filter, false);
                    } else {
                        vm.isMutationalSignatureSelected = false;
                        vm.clearAllMutationalSignatures();
                        vm.filter.genomic_filter.VARIANT_CATEGORY = ['MUTATION'];
                        vm.hidePreviewGraph();
                    }
                };

                /**
                 * Remove any/all selected mutational signatures from filter.genomic_filter and reset VARIANT_CATEGORY
                 * @param refresh
                 */
                vm.clearAllMutationalSignatures = function(refresh) {
                    vm.selectedMutationalSignature = '';
                    vm.isMutationalSignatureSelected = false;
                    vm.filter.genomic_filter.VARIANT_CATEGORY = ['MUTATION'];
                    vm.signatures.forEach(function(signature) {
                    	if (vm.filter.genomic_filter.hasOwnProperty(signature.key)){
                            delete vm.filter.genomic_filter[signature.key]
						}
                    });
                    if (refresh) {
                        vm.fetchIntermediateFilterResults(vm.filter, false);
                    }
                };

				var _svNotice
					=  "<p>Samples sequenced prior to December 2018 had structural variants reported as plain text, e.g. "
				  +  "'Patient is positive for EML4-ALK fusion...', as opposed to structured data, e.g. geneA=EML4, geneB=ALK.</p>"
					+ "<p>For samples with this unstructured data, it is possible that MatchMiner may miss or incorrectly "
					+ "classify some structural variants. For example, a filter for ALK structural variants will match a patient "
					+ "who was 'Negative for ALK rearrangements. </p>"
					+ "<p>Users should therefore always carefully check the structural variant comment for each sample before "
					+ "making a final decision.</p>";
				vm._geneAutocompleteChange = function(gene) {
					if (!!gene) {
						$log.debug("Auto change gene ", vm.filter, gene);

						if (vm.filter.label === null) {
							vm.filter.label = gene;
						}

						if (!!vm.filter.genomic_filter
							&& !!vm.filter.genomic_filter.TRUE_HUGO_SYMBOL
							&& vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.indexOf(gene) == -1) {
							// Add gene to array
                            vm.isGeneSelected = true;
							vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.push(gene);

							/*
							 * When more than 1 gene symbol has been added to the list,
							 * clear the 'protein_change' and 'transcript_exon' fields.
							 */
							if (vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.length > 1) {
								vm.filter.genomic_filter.TRUE_PROTEIN_CHANGE = null;
								vm.data.searchTextProtein = null;
								vm.filter.genomic_filter.TRUE_TRANSCRIPT_EXON = null;
								vm.data.searchTextExon = null;
							} else {
								vm.preloadTranscriptExonForGene(gene);
								vm.preloadProteinChangesForGene(gene);
							}

							// Refresh preview
							vm.fetchIntermediateFilterResults(vm.filter);
						}
					} else {
						vm.fetchIntermediateFilterResults(vm.filter);
					}
				};

				vm.removeGene = function(geneChip) {
					$log.debug("Removed gene chip ", geneChip);
					if( vm.filter.genomic_filter.TRUE_HUGO_SYMBOL
						&& vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.length > 0) {
						var idx = vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.indexOf(geneChip);
						if (idx > -1) {
							vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.splice(idx,1);
						}
					} else {
						// Clear data and invalidate the rest of the filter fields.
						vm.data.searchTextGene = "";
						vm.data.selectedGene = null;
						$log.debug("Clearing data gene. ");
					}

					if (vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.length === 0){
                        vm.isGeneSelected = false;
					}

                    vm.fetchIntermediateFilterResults(vm.filter, false);
				};

				vm.queryGeneSearch = function(geneQuery) {
					if (geneQuery) {
						// Search with query
						geneQuery = geneQuery.toUpperCase();

						var m = [];
						for (var i = 0; i < vm.geneSymbols.length; i++) {
							var elm = vm.geneSymbols[i];
							if (new RegExp('^' + geneQuery, 'i').test(elm)) {
								m.push(elm);
							}
						}

						// Sort and return
						return _.sortBy(m, function (gene) {return gene});
					} else {
						// Return all results
						return vm.geneSymbols;
					}
				};

				/*
				 * Query all available Hugo Gene Symbols from the backend and store.
				 * Returns array with gene symbols
				 */
				vm.loadAllGenes = function(){
					vm.isLoadingGeneSymbols = true;

					var q = {
						resource: 'genomic',
						field: 'TRUE_HUGO_SYMBOL'
					};

					// Init if uninitialized
					if (!vm.filter.genomic_filter.TRUE_HUGO_SYMBOL) {
						vm.filter.genomic_filter.TRUE_HUGO_SYMBOL = [];
					}

					return UtilitiesService.queryUnique(q).$promise.then( function(res) {
						vm.geneSymbols = _.sortBy(res.values, function (gene) {return gene});
						vm.isLoadingGeneSymbols = false;
						return res.values;
					});
				};

				/*
				 * Use keyword from the oncotree diagnosis autocomplete and search through diagnosis array.
				 * Returns array with case insensitive matched strings.
				 */
				vm.queryOncotreeData = function(oncotreeDiagnosis) {
					if (oncotreeDiagnosis) {
						// Search with query
						oncotreeDiagnosis = oncotreeDiagnosis.toUpperCase();

						var m = [];
						for (var i = 0; i < vm.oncotreeData.length; i++) {
							var elm = vm.oncotreeData[i];
							var txtElm = elm.text;
							var match = false;

							if (new RegExp('^' + oncotreeDiagnosis, 'i').test(txtElm)) {
								m.push(elm);
								match = true;
							}

							var codeElm = elm.code;
							if (new RegExp('^' + oncotreeDiagnosis, 'i').test(codeElm) && !match) {
								m.push(elm);
							}
						}

						// Sort and return
						return _.sortBy(m, function (otd) {return otd.text});
					} else {
						// Return all results
						return vm.oncotreeData;
					}
				};

				/*
				 * Load all available oncotree diagnoses from the API and store.
				 * Returns array with all oncotree diagnoses strings.
				 */
				vm.loadAllOncotreeData = function () {
					vm.isLoadingOncotreeData = true;

					var q = {
						resource: 'clinical',
						field: 'ONCOTREE_PRIMARY_DIAGNOSIS_NAME'
					};

					return UtilitiesService.queryUnique(q).$promise.then( function(res) {
						vm.oncotreeData = _.sortBy(res.values, function (otd) {return otd});
						vm.isLoadingOncotreeData = false;
						return res.values;
					});
				};

				vm.preloadProteinChangesForGene = function(g) {
					if (!g) return false;
					$log.debug("Preloading Protein change data for ", g);
					vm.isLoadingProteinChanges = true;

					var q = {
						resource: 'genomic',
						field: 'TRUE_PROTEIN_CHANGE',
						value: "",
						gene: g
					};

					vm.proteinChangeData = [];

					return AutocompleteService.queryAutocomplete(q).$promise.then( function(res){
						vm.proteinChangeData = _.sortBy(res.values, function (ptd) {return ptd});
						vm.isLoadingProteinChanges = false;
						return res.values;
					});
				};

				/*
				 * Query protein change data on preloaded protein change data.
				 */
				vm.queryProteinChange = function(ptq) {
					if (ptq) {
						// Search with query
						ptq = ptq.toUpperCase();

						var m = [];
						for (var i = 0; i < vm.proteinChangeData.length; i++) {
							var elm = vm.proteinChangeData[i];
							if (new RegExp(ptq, 'i').test(elm)) {
								m.push(elm);
							}
						}

						// Sort and return
						return _.sortBy(m, function (pc) {return pc});
					} else {
						// Return all results
						return vm.proteinChangeData;
					}
				};

				vm.preloadTranscriptExonForGene = function(g) {
					if (!g) return false;
					$log.debug("Preloading Transcript exon data for ", g);
					vm.isLoadingTranscriptExonData = true;


					var q = {
						resource: 'genomic',
						field: 'TRUE_TRANSCRIPT_EXON',
						value: "",
						gene: g
					};
					vm.transcriptExonData = [];
					return AutocompleteService.queryAutocomplete(q).$promise.then( function(res){
						vm.transcriptExonData = _.sortBy(res.values, function (ted) {return ted});
						vm.isLoadingTranscriptExonData = false;
						return res.values;
					});
				};

				/*
				 * Query transcript exon data on preloaded transcriptExonData.
				 */
				vm.queryTranscriptExon = function(teq) {
					if (teq) {
						// Search with query
						teq = teq.toUpperCase();

						var m = [];
						for (var i = 0; i < vm.transcriptExonData.length; i++) {
							var elm = vm.transcriptExonData[i];
							if (new RegExp(teq, 'i').test(elm)) {
								m.push(elm);
							}
						}

						// Sort and return
						return _.sortBy(m, function (te) {return te});
					} else {
						// Return all results
						return vm.transcriptExonData;
					}
				};

				/* Wizard navigation */
				vm.nextTab = function() {
					vm.selectedTab += 1;
				};

				vm.previousTab = function() {
					vm.selectedTab -= 1;
				};

				/*
				 * Filters overview
				 */
				vm.filters = {};
				vm.filterStates = {
					'-' : 'All',
					'0' : 'Inactive',
					'1' : 'Active'
				};
				vm.filterStatuses = {
					'0' : {
						status : 'Inactive',
						toggleAction : 'Activate'
					},
					'1' : {
						status : 'Active',
						toggleAction : 'Deactivate'
					}
				};

				/**
				 * Save a new genomicfilter created in the wizard and notify user
				 */
				vm.saveFilter = function(filter) {
					$log.debug("Saving genomic filter ", filter);
					vm.isProcessingBusy = true;

					// Save as ACTIVE filter.
					filter.status = 1;
					filter.temporary = false;

                    filter = vm.addBlankHugoSymbol(filter);

					// Sanitise genomic filter to make it compatible with the API.
					var f = MatchminerApiSanitizer.transformGenomicFilter(angular.copy(filter), true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);

					delete f.enrollment;
					delete f.matches;

					FiltersREST.saveGenomicFilter(f)
						.$promise
						.then( function (res){
							$log.debug("Successfully saved filter " + res._id);
							$log.debug("Filter ", res);

							/*
							 * Clear Match filters
							 */
							if ($rootScope.tableFilter) {
								delete $rootScope.tableFilter.date;
								delete $rootScope.tableFilter.filter;
							}

							if ($rootScope.matchQuery) {
								delete $rootScope.matchQuery.FILTER_ID;
								delete $rootScope.matchQuery.REPORT_DATE;
							}
							// Show success msg
							ToastService.success("Save success. " + res.num_samples + " matches were marked as 'Pending'.");
							$timeout( function(){
								vm.isProcessingBusy = false;
								$state.go('filters-overview');
							}, 500);
						})
						.catch( function(err){
							vm.isProcessingBusy = false;
							$log.error("caught err in promise ", err);
							ToastService.warn(err)
						});
				};

                /**
                 * When adding/updaing filters with mutational signatures, need to send a blank hugo symbol array so API doesn't crash
                 */
                vm.addBlankHugoSymbol = function(filter) {
                    if (vm.isMutationalSignatureSelected) {
                        filter.genomic_filter.TRUE_HUGO_SYMBOL = [""];
                    }
                    return filter;
                };

				/**
				 * Update a previously stored genomicfilter in the backend and notify user
				 */
				vm.updateGenomicFilter = function(filter) {
					$log.debug("Updating filter ", filter);
					vm.isProcessingBusy = true;
					var fc = angular.copy(filter);

					// Use the tokenHandler to set the etag which needs updating.
					tokenHandler.set(fc._etag);

					$log.debug("PRE-Sanitization ID " + fc._id);
					$log.debug("PRE-Sanitization Filter ", fc);

                    fc = vm.addBlankHugoSymbol(fc);

                    // Sanitize eve match resource.
					var f = MatchminerApiSanitizer.transformGenomicFilter(angular.copy(fc), true, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);
					f = MatchminerApiSanitizer.sanitizeEveResource(angular.copy(f), {}, true);

					delete f.enrollment;
					delete f.matches;
					delete f.description;

					$log.debug("Using etag token for update :: ", tokenHandler.get());
					FiltersREST.updateGenomicFilter(f)
						.$promise
						.then( function (res){
							$log.debug("Successfully updated filter " + res._id);
							$log.debug("Filter", res);

							// Show success msg
							if(!!res.num_samples) {
								ToastService.success("Update success. " + res.num_samples + " matches were marked as 'Pending'.");
							} else {
								ToastService.success("Successfully updated filter.");
							}

							/*
							 * Clear Match filters
							 */
							if ($rootScope.tableFilter) {
								delete $rootScope.tableFilter.date;
								delete $rootScope.tableFilter.filter;
							}

							if ($rootScope.matchQuery) {
								delete $rootScope.matchQuery.FILTER_ID;
								delete $rootScope.matchQuery.REPORT_DATE;
							}

							$timeout( function(){
								vm.isProcessingBusy = false;
								$state.go('filters-overview');
							}, 1000);
						})
						.catch( function(err){
							$log.error("[ERROR] Updating genomic filter ", err);
							vm.isProcessingBusy = false;
							ToastService.warn("Error updating genomic filter.")
						});
				};

				/**
				 * Add or remove a selected alteration.
				 * @param alt
				 * @returns {boolean}
				 */
				vm.toggleAlterationSelection = function(alt) {
					if (!alt || !alt.is_available || vm.isMutationalSignatureSelected) {
						return false;
					}

					vm.filter = MatchminerApiSanitizer.transformGenomicFilter(vm.filter, false, ['VARIANT_CATEGORY']);
					var vcIdx = vm.filter.genomic_filter['VARIANT_CATEGORY'].indexOf(alt.variant_category);

					if (!vm.filter.genomic_filter.CNV_CALL) {
						vm.filter.genomic_filter.CNV_CALL = [];
					}

					// Has variant category.
					if (vcIdx > -1) {

						// Has CNV call in item
						if (!!alt.cnv_call) {
							var ccIdx = vm.filter.genomic_filter['CNV_CALL'].indexOf(alt.cnv_call);
							if (ccIdx > -1) {
								vm.filter.genomic_filter['CNV_CALL'].splice(ccIdx, 1);
							} else {
								vm.filter.genomic_filter['CNV_CALL'].push(alt.cnv_call);
							}
							// No more CNV calls selected. Remove variant category
							if ((!!vm.filter.genomic_filter['CNV_CALL']
								&& vm.filter.genomic_filter['CNV_CALL'].length == 0)
								|| !vm.filter.genomic_filter['CNV_CALL']) {
								$log.debug("No more CNV calls");
								vm.filter.genomic_filter['VARIANT_CATEGORY'].splice(vcIdx, 1);
							}

						} else {
							vm.filter.genomic_filter['VARIANT_CATEGORY'].splice(vcIdx, 1);
						}
					} else {
						// If CNV call is defined add to CNV call.
						if (!!alt.cnv_call) {
							vm.filter.genomic_filter['CNV_CALL'].push(alt.cnv_call);
						}

						// Show warning to user when selecting a SV genomic alteration
						if (alt.variant_category == 'SV') {
							var alert
								= $mdDialog
								.alert()
								.htmlContent(_svNotice)
								.ok('OK');
							$mdDialog
								.show( alert )
								.finally(function() {
									alert = undefined;
								});
						}

						vm.filter.genomic_filter['VARIANT_CATEGORY'].push(alt.variant_category);
					}

					vm.fetchIntermediateFilterResults(vm.filter, false);
				};

				vm.hasAlteration = function (alt) {
					var gf = vm.filter.genomic_filter;
					if (vm.hasVariantCategory(alt.variant_category)) {
						// Has CNV call
						if (alt.cnv_call) {
							return !!(!!gf.CNV_CALL && gf.CNV_CALL.indexOf(alt.cnv_call) > -1);
						} else {
							return true;
						}
					} else {
						return false;
					}
				};

				vm.hasVariantCategory = function (item) {
					var gf = angular.copy(vm.filter.genomic_filter);

					if (!gf['VARIANT_CATEGORY']) {
						return false;
					} else {
						return gf['VARIANT_CATEGORY'].indexOf(item) > -1;
					}
				};

				/*
				 * Clear the scope genomicFilter object and result values to reset the form and scope to the initial state
				 */
				vm.clearForm = function() {
					$log.debug("Clearing form.");
					vm.filter = {};
					vm.filter.TEAM_ID = vm._teamId;
					vm.filter.USER_ID = vm._userId;
					vm.filter.temporary = false;
					vm.filter.badgeTextColor = "black";
					vm.filter.clinical_filter = {};
					vm.filter.genomic_filter = {};
					vm.filter.genomic_filter.WILDTYPE = false;
					vm.filter.genomic_filter.TRUE_HUGO_SYMBOL = [];

					if(!vm.filter.genomic_filter.VARIANT_CATEGORY) {
						vm.filter.genomic_filter.VARIANT_CATEGORY = {};
					}

					vm.filter.genomic_filter.VARIANT_CATEGORY = ['MUTATION'];

					/**
					 * Temporary data variables
					 */
					$log.debug("Set temporary form data placeholders");
					vm.data = {};
					vm.data.selectedGene = [];
					vm.data.reportDate = {};
					vm.data.reportDate.prefix = 'all';
					vm.data.reportDate.date = null;
					vm.data.ageRange = {};
					vm.data.ageRange.prefix = 'all';
					vm.data.ageRange.date = null;
					$rootScope.loadedGenomicFilter = false;
				};

				var _errorQuery = function(err) {
					$log.error("[ERROR] Fetching genomic filters. ", err);
					ToastService.warn("Error while fetching genomic filters.");
				};

				vm.isValidFilter = function(gf) {
					return !(!gf
					|| !gf.label
					|| !gf.genomic_filter
					|| !gf.clinical_filter
					|| !gf.protocol_id
					|| (vm.selectedCancerTypeCategory == CANCERTYPE_SPECIFIC
							&& gf.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME == null)
					 || ((gf.genomic_filter.TRUE_HUGO_SYMBOL == null || !gf.genomic_filter.TRUE_HUGO_SYMBOL.length) && !vm.isMutationalSignatureSelected)
					|| (!!vm.data.ageRange
					&& ((vm.data.ageRange.prefix == '^lte' || vm.data.ageRange.prefix == '^gte')
					&& !vm.data.ageRange.date))
					|| (!gf.genomic_filter.VARIANT_CATEGORY || gf.genomic_filter.VARIANT_CATEGORY.length == 0));

				};

				vm.updateCancerType = function(ct, filter, isReset) {
					vm.selectedCancerType = ct;
					vm.fetchIntermediateFilterResults(filter, isReset);
					return ct;
				};

				/**
				 * Save intermediateFilter to display match results in the plots.
				 * Pre-save the filter is sanitized for the API.
				 * Params:
				 *    - genomic filter object
				 *    - isReset form boolean
                 *
                 *    When using this function with md-autocomplete, a debounce is
                 *    also required https://github.com/angular/material/issues/3003.
				 */
				vm.fetchIntermediateFilterResults = function(filter, isReset) {
					$log.debug("Creating intermediate filter. ", filter, vm.selectedCancerType);
					vm.isProcessingBusy = true;

					if(!filter) {
						$log.warn("No filter defined.");
						return false;
					}

					if (!filter.genomic_filter && !filter.clinical_filter) {
						$log.warn("Exiting creation... No genomic or clinical filter criteria defined!");
						vm.isProcessingBusy = false;
						return false;
					}

					/**
					 * Check for presence of transcript exon or protein_change
					 * When present, disable the CNV/SV subset of genomic alteration options
					 * and remove the selected options from the filter
					 * When absent, enable them.
					 */
					if (filter.genomic_filter.TRUE_PROTEIN_CHANGE || filter.genomic_filter.TRUE_TRANSCRIPT_EXON) {
						vm.clearCnvSvFromFilter(filter);
						vm.toggleCnvSvAlterationState(true);
					} else {
						// Enable the CNV / SV options
						vm.toggleCnvSvAlterationState(false);
					}

					if (vm.loadingIntermediate || isReset || $rootScope.isReset) {
						$log.warn("Exiting creation... ", vm.loadingIntermediate, isReset, $rootScope.isReset);
						vm.isProcessingBusy = false;
						return false;
					}

					/*
					 * Check HUGO_SYMBOL selection
					 */
					if ((!filter.genomic_filter.TRUE_HUGO_SYMBOL || !filter.genomic_filter.TRUE_HUGO_SYMBOL.length)
						&& !$rootScope.loadedGenomicFilter
						&& !vm.isMutationalSignatureSelected) {
						$log.warn("Exiting creation... No HGS set - Field cleared. Removing plot");
						vm.isProcessingBusy = false;
						vm.hidePreviewGraph();
						return false;
					}

                    // #hack if mutational signatures are checked send empty gene array so API doesn't crash
					filter = vm.addBlankHugoSymbol(filter);

					// Check and set cancer type.
					filter = vm.checkAndSetCancerType(filter);

					/*
					 * Modifies scope *
					 * Ensure mutual exclusive 'Protein Change' and 'Transcript Exon'
					 * Prioritizes Protein Change over Transcript Exon
					 */
					if (filter.genomic_filter) {
						var gf = filter.genomic_filter;

						if (gf.TRUE_PROTEIN_CHANGE != null) {
							delete vm.filter.genomic_filter.TRUE_TRANSCRIPT_EXON;
							delete filter.genomic_filter.TRUE_TRANSCRIPT_EXON;
						} else if (gf.TRUE_TRANSCRIPT_EXON != null) {
							delete vm.filter.genomic_filter.TRUE_PROTEIN_CHANGE;
							delete filter.genomic_filter.TRUE_PROTEIN_CHANGE;
						}
					}

					if (
						vm.selectedCancerTypeCategory == CANCERTYPE_SPECIFIC
						&& (!vm.selectedCancerType
						|| vm.selectedCancerType == '')
					) {
						vm.isProcessingBusy = false;
						return false;
					}

					$rootScope.loadedGenomicFilter = false;

					if (!!filter.clinical_filter && filter.clinical_filter.GENDER == 'null') {
						delete filter.clinical_filter.GENDER;
					}

					vm.loadingIntermediate = true;

					/*
					 * Reset the required graph elements.
					 */
					$('#plotResults').show();
					$('#loadingPlot').show();
					$('#filterPlot').hide();
					$('#histogramPlot').hide();
					$('#emptyPlot').hide();
					$('#noPlotData').hide();

					/*
					 * If genomic filter is loaded or a previously saved genomic filter
					 * then do not change the status and just fetch the match results.
					 * Prior to doing this clean up the copied genomic filter by removing all ID's
					 */
					$log.debug("Sanitizing intermediate filter object.");

					var f = MatchminerApiSanitizer.sanitizeEveResource(angular.copy(filter), {}, true);
					var tf =  MatchminerApiSanitizer.transformGenomicFilter(
						f,
						true,
						['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']
					);
					var intermediateFilter = angular.copy(tf);
					// Force to intermediate status.
					intermediateFilter.status = 2;
					if ( $rootScope.loadedGenomicFilter || ( filter.status == 1 && filter._id)) {
						delete intermediateFilter._id;
					}

					intermediateFilter.temporary = true;
					delete intermediateFilter.enrollment;
					delete intermediateFilter.matches;
					delete intermediateFilter.description;

					FiltersREST.saveGenomicFilter(intermediateFilter)
						.$promise
						.then( function(filter) {
							$log.debug("Intermediate filter saved. " + filter._id);

							//#hack to remove extra chip from showing up when selecting mutational signature
                            if (vm.isMutationalSignatureSelected) {
                                vm.filter.genomic_filter.TRUE_HUGO_SYMBOL = [];
                            }

							GraphService.hideOrShow(filter);

							vm.charts = {};

							var accrualY = filter.enrollment.y_axis;
							var accrualX = filter.enrollment.x_axis;

							while(accrualY[accrualY.length - 1] === 0) {
								accrualX.pop();
								accrualY.pop();
							}

							var maxX = moment(accrualX[accrualX.length - 1], "YY-MM-DD");

                            vm.charts.enrollment = {
                                data: accrualY,
                                labels: accrualX.map(function (x) { return moment(x, "YY-MM-DD")}),
                                options: {
                                    title: {
                                        display: true,
                                        text: 'Accrual Rate',
										fontSize: 16
                                    },
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    elements: {
                                        line: {
                                            fill: false,
											borderColor: '#36a2eb'
                                        },
										point: {
                                        	radius: 0
										},
                                    },
                                    scales: {
                                        yAxes: [{
                                            ticks: {
                                                beginAtZero: true,
                                                fontSize: 13,
                                                callback: function(tick, index, ticksArray) {
                                                    if (Math.floor(tick) === tick) {
                                                        if (ticksArray[0] === ticksArray[1] + (ticksArray[1] - ticksArray[2])) return tick;
                                                        else if (ticksArray[0] === tick) return undefined;
                                                        return tick;
                                                    }
                                                },
                                                max: _.max(accrualY) * 1.1

                                            },
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Patient Count',
												fontSize: 14.5
                                            }
                                        }],
                                        xAxes: [{
                                            type: 'time',
                                            time: {
                                                unit: 'year',
                                                max: maxX.isBefore(moment(), 'month') ? maxX : moment()
                                            },
                                            ticks: {
                                                fontSize: 13,
                                                callback: function(value, i, values) {
                                                    if (i + 1 === values.length) {
                                                        return moment(values[i]).format('MMM YYYY')
                                                    }
                                                    // } else if (i === values.length - 2) {
                                                    //     return '';
                                                    // }
                                                	return value;
                                                }
                                            },
                                            gridLines: {display: false}
                                        }]
                                    },
                                    tooltips: {
                                        enabled: true,
                                        displayColors: false,
                                        filter: function (tooltipItem) {
                                            if (tooltipItem) {
                                                return Number(tooltipItem.xLabel) > 0;
                                            }
                                            return false;
                                        },
                                        callbacks: {
                                            title: function (tooltipItem) {
                                                if (tooltipItem.length > 0) {
                                                    return moment(tooltipItem[0].xLabel).format("MMM YYYY");
                                                }
                                            },
                                            label: function (tooltipItems) {
                                            	return tooltipItems.yLabel + ' patients';
                                            },
                                        }
                                    }
                                }
                            };

                            vm.charts.matches = {
                            	colors: ['#ff6384', '#36a2eb', '#cc65fe'],
								data: [filter.num_genomic_samples, filter.num_clinical, filter.num_samples],
								labels: ['Genomic', 'Clinical', ['Genomic &', 'Clinical']],
                                options: {
                                    title: {
                                        display: true,
                                        text: 'Patient Matches',
                                        fontSize: 16,
                                    },
                                    scales: {
                                        xAxes: [{
                                            ticks: {
                                                fontSize: 13
											},
                                            gridLines: {display: false}
										}],
                                        yAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: 'Patient Count',
                                                fontSize: 14.5
                                            },
											ticks: {
                                                fontSize: 13,
                                                callback: function(tick, index, ticksArray) {
                                                    if (Math.floor(tick) === tick) {
                                                        if (ticksArray[0] === ticksArray[1] + (ticksArray[1] - ticksArray[2])) return tick;
                                                        else if (ticksArray[0] === tick) return undefined;
                                                        return tick;
                                                    }
                                                },
                                                max: Math.max(filter.num_genomic_samples, filter.num_clinical, filter.num_samples) * 1.1
											}
                                        }]
                                    },
                                    tooltips: {
                                        callbacks: {
                                            label: function (tooltipItems) {
                                                return tooltipItems.yLabel + ' patients';
                                            },
                                        }
                                    },
                                    animation: {
                                        duration: 1,
                                        onComplete: function() {
                                            var chartInstance = this.chart,
                                                ctx = chartInstance.ctx;

                                            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                                            ctx.textAlign = 'center';
                                            ctx.textBaseline = 'bottom';

                                            this.data.datasets.forEach(function(dataset, i) {
                                                var meta = chartInstance.controller.getDatasetMeta(i);
                                                meta.data.forEach(function(bar, index) {
                                                    var data = dataset.data[index];
                                                    ctx.fillText(data, bar._model.x, bar._model.y - 5);
                                                });
                                            });
                                        }
                                    },
                                }
                            };

                            vm.filter.enrollment = true;
                            vm.filter.matches = true;

							vm.loadingIntermediate = false;
							vm.isProcessingBusy = false;

						}).catch(_errorQuery);
				};


				/**
				 * Iterate over the list of genomic alterations and toggle the
				 * present CNV / SV alterations on or off.
				 * @param toggle
				 */
				vm.toggleCnvSvAlterationState = function(toggle) {
					_.each(vm.genomicAlterations, function(obj, altKey) {
						if (vm.cnvSvAlterations.indexOf(altKey) > -1) {
							vm.genomicAlterations[altKey].is_available = !toggle;
						}
					});
				};

				/**
				 * Remove present CNV / SV alterations from the argumented filter.
				 * @param filter
				 */
				vm.clearCnvSvFromFilter = function(filter) {
					filter.genomic_filter.CNV_CALL = [];
					var svIdx = filter.genomic_filter['VARIANT_CATEGORY'].indexOf('SV');
					if (svIdx > -1) {
						filter.genomic_filter['VARIANT_CATEGORY'].splice(svIdx, 1);
					}
				};

				vm.hidePreviewGraph = function() {
					$('#loadingPlot').hide();
					$('#filterPlot').hide();
					$('#histogramPlot').hide();
					$('#emptyPlot').show();
					$('#plotResults').show();
					$('#noPlotData').hide();
				};

				vm.clearMatchFilters = function() {
					/*
					 * Clear Match filters
					 */
					if ($rootScope.tableFilter) {
						delete $rootScope.tableFilter.date;
						delete $rootScope.tableFilter.filter;
					}

					if ($rootScope.matchQuery) {
						delete $rootScope.matchQuery.FILTER_ID;
						delete $rootScope.matchQuery.REPORT_DATE;
					}
				};

				/*
				 * Filter wizard dialog
				 */
				vm.checkAndSetCancerType = function(filter) {
					if (!filter.clinical_filter) {
						return filter;
					}

					if (!vm.selectedCancerTypeCategory
						|| vm.selectedCancerTypeCategory == 'ALL') {
						filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME = null;
						vm.selectedCancerType = null;
						return filter;
					}

					if (vm.selectedCancerTypeCategory != CANCERTYPE_SPECIFIC)
					{
						vm.selectedCancerType = 'All ' + vm.cancerTypes[vm.selectedCancerTypeCategory];
						filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME = vm.selectedCancerTypeCategory;
					} else if (vm.selectedCancerTypeCategory == CANCERTYPE_SPECIFIC) {
						if (vm.selectedCancerType == null
							|| filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME == CANCERTYPE_LIQUID
							|| filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME == CANCERTYPE_SOLID
						) {
							vm.data.searchOncotreeText = "";
							vm.selectedCancerType = null;
							filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME = null;
						} else {
							filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME = vm.selectedCancerType.text;
						}
					}

					return filter;
				};

				vm.updateDateField = function(dataField, comparatorValue, value) {
					// Does filter have a clinical_filter
					if(!vm.filter.clinical_filter) {
						vm.filter.clinical_filter = {};
					}

					// If dataValue is 'all', clear value for dataField
					if (comparatorValue == 'all') {
						// Clear tmp field value.
						vm.data[dataField].date = null;

						// Clear values for intermediate filter.
						if (dataField == 'ageRange') {
							vm.filter.clinical_filter.BIRTH_DATE = null;
						} else if (dataField == 'reportDate') {
							vm.filter.clinical_filter.REPORT_DATE = null;
						} else {
							$log.warn("Unknown data field ", dataField);
						}

						// Update the intermediate filter.
						vm.fetchIntermediateFilterResults(vm.filter, false);
					} else {
						if (!value) {
							return false;
						}
						// Calculate date and set
						// field : { '$lte : 'date' }
						if (dataField == 'ageRange' && value > 0) {
							// Calculate difference
							// CurrentDate - set age
							var d = new Date(Date.now());
							d.setFullYear(d.getFullYear() - value);

							vm.filter.clinical_filter.BIRTH_DATE = {};
							vm.filter.clinical_filter.BIRTH_DATE[comparatorValue] = d;
							$log.debug("BIRTH DATE ", d, vm.filter);
						} else if (dataField == 'reportDate') {
							vm.filter.clinical_filter.REPORT_DATE = {};
							vm.filter.clinical_filter.REPORT_DATE[comparatorValue] = value;
							$log.debug("REPORT DATE ", value);
						} else {
							$log.warn("Unknown data field - non all", dataField);
						}

						// Update the intermediate filter.
						vm.fetchIntermediateFilterResults(vm.filter, false);
					}
				};

				vm.initLoadedFilter = function(filter) {
					// Load HGS selection
					$log.debug("Loading scope model ", angular.copy(filter));

					if (!!filter.clinical_filter) {
						// Process cancer type.
						if(!!filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME) {
							// Is value _SOLID_ or _LIQUID_ cancertype?
							if (filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME == CANCERTYPE_SOLID
								|| filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME == CANCERTYPE_LIQUID) {
								vm.selectedCancerTypeCategory = filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME;
							} else {
								vm.selectedCancerTypeCategory = CANCERTYPE_SPECIFIC;
								var query = vm.queryOncotreeData(filter.clinical_filter.ONCOTREE_PRIMARY_DIAGNOSIS_NAME);
								vm.selectedCancerType = query[0]; // Pick first result from the OncotreeData results.
							}
						}

						// Process clinical filter age
						var birthDate = filter.clinical_filter.BIRTH_DATE;
						if (!!birthDate) {
							vm.data.ageRange = {};
							if ('^lte' in birthDate) {
								vm.data.ageRange.prefix = '^lte';
								vm.data.ageRange.date = new Date(new Date - new Date(birthDate['^lte'])).getFullYear()-1970
							} else if ('^gte' in birthDate) {
								vm.data.ageRange.prefix = '^gte';
								vm.data.ageRange.date = new Date(new Date - new Date(birthDate['^gte'])).getFullYear()-1970
							} else {
								vm.data.ageRange.prefix = 'all';
								vm.data.ageRange.date = null;
								$log.error("Unknown birth day field.", birthDate);
							}
						}

						// Process clinical filter report date
						var reportDate = filter.clinical_filter.REPORT_DATE;
						if (!!reportDate) {
							vm.data.reportDate = {};
							if ('^lte' in reportDate) {
								vm.data.reportDate.prefix = '^lte';
								vm.data.reportDate.date = new Date(reportDate['^lte']);
							} else if ('^gte' in reportDate) {
								vm.data.reportDate.prefix = '^gte';
								vm.data.reportDate.date = new Date(reportDate['^gte']);
							} else {
								vm.data.reportDate.prefix = 'all';
								vm.data.reportDate.date = new Date();
								$log.error("Unknown report date field. ", reportDate);
							}
						}
					}

					/* Sanitise filter from API object to UI object */
					vm.filter = MatchminerApiSanitizer.transformGenomicFilter(filter, false, ['TRUE_HUGO_SYMBOL', 'VARIANT_CATEGORY', 'CNV_CALL']);

					if(vm.filter.genomic_filter.TRUE_HUGO_SYMBOL.length == 1) {
						$log.debug("Preloading data for ", vm.filter);
						var gene = vm.filter.genomic_filter.TRUE_HUGO_SYMBOL[0];
						vm.preloadTranscriptExonForGene(gene);
						vm.preloadProteinChangesForGene(gene);
					}

					// Load mutational signature
					for(var i = 0; i < vm.signatures.length; i++) {
						if (filter.genomic_filter.hasOwnProperty(vm.signatures[i].key)) {
                            vm.isMutationalSignatureSelected = true;
							if (filter.genomic_filter.hasOwnProperty('MMR_STATUS')) {
                                if (filter.genomic_filter.MMR_STATUS === 'Proficient (MMR-P / MSS)') {
                                    vm.selectedSignature = 'MMR-Proficient'
								} else {
                                    vm.selectedSignature = 'MMR-Deficient'
								}
							} else {
                                vm.selectedSignature = vm.signatures[i].name;
							}
							break;
						}
					}

					ToastService.success("Successfully loaded genomic filter");
					vm.fetchIntermediateFilterResults(vm.filter, false);
				};

				/**
				 * Data initialisation
				 * Do we have to load a filter?
				 */
				vm.clearForm();
				vm.loadAllGenes();
				vm.loadAllOncotreeData();

				var fid = $stateParams.id;

				if (!!fid && fid != 'new') {
					FiltersREST.findOne({id: fid}).$promise
						.then( function(filter) {
							$rootScope.loadedGenomicFilter = true;

							$log.debug("LOADING FILTER ", filter);

							if(!filter.genomic_filter.VARIANT_CATEGORY) {
								filter.genomic_filter.VARIANT_CATEGORY = {};
							}

							$q.when()
								// Ensure the oncotree data is loaded.
								.then( function() {
									var q = {
										resource: 'clinical',
										field: 'ONCOTREE_PRIMARY_DIAGNOSIS_NAME'
									};

									return UtilitiesService.queryUnique(q).$promise;
								})
								.then( function(oc) {
									if (!vm.oncotreeData) {
										vm.oncotreeData = oc.values;
									}
									/* Initialize filter into scope */
									vm.initLoadedFilter(filter);
								});
						}).catch(_errorQuery);
				}

				vm.showFilters = function () {
					$state.go('filters-overview');
				};
			}]);
