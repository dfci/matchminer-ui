'use strict';

/**
 * @ngdoc function
 * @name matchminerUiApp.controllerPatientsCtrl:
 * @description
 * # PatientsCtrl
 * Patient Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
    .filter('orderObjectBy', function(){
        return function(input, secondary) {
            if (!angular.isObject(input)) return input;
            if (!angular.isFunction(secondary)) return input;
            
            var array = [];
            for(var objectKey in input) {
                array.push(input[objectKey]);
            }
            
            array = _.partition(array, function(item) {
                return secondary({collection: item})
            })
            
            array = array.map(function(e) {
                return e.sort(function(a, b){
                    a = parseInt(a[0].CNV_ROW_ID);
                    b = parseInt(b[0].CNV_ROW_ID);
                    return a - b;
                })
            });
            
            return _.flatten(array, true);
        }
    })
	.controller('PatientDetailsCtrl',
		['$scope', '$stateParams', '$q', '$log', '$state', 'PatientsREST', 'ToastService', 'DTOptionsBuilder', 'TEMPLATES', '$document', '$mdMedia', '$mdDialog', 'deviceDetector', 'patient', 'ClinicalTrialsService', 'NegativeGenomicREST', 'TrialMatchService', 'UserAccount', '$window', 'ENV', 'ImmunoprofileREST','UtilitiesService',
			function ($scope, $stateParams, $q, $log, $state, PatientsREST, ToastService, DTOptionsBuilder, TEMPLATES, $document, $mdMedia, $mdDialog, deviceDetector, patient, ClinicalTrialsService, NegativeGenomicREST, TrialMatchService, UserAccount, $window, ENV, ImmunoprofileREST, UtilitiesService) {
				var pc = this;
				pc.sidebarScroll = 0;
				pc.TEMPLATES = TEMPLATES.patient_view;
				pc.ENV = ENV;
				
				pc.isCti = UserAccount.roles.indexOf('cti') > -1;
				pc.isOncologist = UserAccount.roles.indexOf('oncologist') > -1;
				pc.isAdmin = UserAccount.roles.indexOf('admin') > -1;
				pc.resize = true;
				pc.vital_status = null;
				pc.TEST_NAME = '';
				pc.immunoprofile = null;
								
				if (pc.patient) {
					ClinicalTrialsService.setMRN(pc.patient.clinical.MRN);
				}
				
                var lastWidth, currentWidth, initialWidth, lastScroll, currentScroll, scrollReset, recentSidebarSwitch;
                lastWidth = currentWidth = initialWidth = $window.innerWidth;
                lastScroll = currentScroll = 0;
                scrollReset = recentSidebarSwitch = true;
				
                pc.showAnyFilters = function(cnvs) {
                    return _.some(cnvs, function(cnv) {return cnv.FILTER && cnv.FILTER.length > 0});
                };

				var browser = deviceDetector.browser;
				pc.isSafari = browser == "safari";
				pc.selectedTab = 0;

				pc.sampleIcons = {
					1: 'looks_one',
					2: 'looks_two',
					3: 'looks_3',
					4: 'looks_4',
					5: 'looks_5',
					6: 'looks_6'
				};

				var groupByValue = function(xs, key) {
					return xs.reduce(function(rv, x) {
						(rv[x[key]] = rv[x[key]] || []).push(x);
						return rv;
					}, {});
				};

				// Do we have to load a patient?
				var pid = $stateParams.patient_id;

				$scope.$watch(
					function() {
						return $mdMedia('gt-sm');
					}, function(isGtSm) {
						pc.isGtSm = isGtSm;
				});
                
                if (pc.isSafari) {
                    angular.element($window).bind('resize', function () {
                        lastWidth = currentWidth;
                        currentWidth = $window.innerWidth;
                        pc.shouldShowSpacingWidth = checkSidebarSpacingWidth(lastWidth, currentWidth);
                    });
    
                    angular.element($window).bind('scroll', function () {
                        lastScroll = currentScroll;
                        currentScroll = $window.scrollY;
                        checkSidebarSpacingScroll(lastScroll, currentScroll);
                    });
                }
                
                var checkSidebarSpacingWidth = function(last, current) {
                    if (initialWidth >= 1200 && current <= 1200 && scrollReset) {
                        pc.resize = true;
                    }
                    if (initialWidth < 1200 && current >= 1200 && scrollReset) {
                        pc.resize = true;
                    }
                    if (last < 960 && current >= 960) {
                        recentSidebarSwitch = false;
                        pc.resize = true;
                        return true;
                    }
                    if (!scrollReset && last >= current) {
                        pc.resize = true;
                        scrollReset = false;
                    }
                    if (current >= 960) {
                        return true;
                    }
                    return false;
                }
                
                var checkSidebarSpacingScroll = function(last, current) {
                    if (last <= 193 && current > 193) {
                        scrollReset = true;
                        pc.resize = false;
                    }
                }

				/**
				 * Keep track of updates in the clinical trial collection
				 */
				$scope.$watchCollection(
					function () {
						return ClinicalTrialsService.getAll();
					},
					function (newTrials) {
						if (newTrials !== undefined) {
							pc.numTrials = newTrials.length;
						}
						if (pc.patient) {
							ClinicalTrialsService.setMRN(pc.patient.clinical.MRN);
						}
					}
				);

				var dtBaseOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withOption('order', [[0, "asc"]]);

				pc.dtPmOpts = angular.copy(dtBaseOptions);
				pc.dtCNVOpts = angular.copy(dtBaseOptions);
				pc.dtAltCNVOpts = angular.copy(dtBaseOptions);
				pc.dtSVOpts = angular.copy(dtBaseOptions);
				pc.dtNGOpts = angular.copy(dtBaseOptions);
				pc.dtIPOptions = DTOptionsBuilder.newOptions().withOption('bFilter', false).withOption('bPaginate', false).withOption('bInfo', false);
				pc.dtRHPOptions = DTOptionsBuilder.newOptions().withOption('bFilter', false).withOption('bPaginate', false).withOption('bInfo', false);
				pc.dtRHPOptionsPaged = DTOptionsBuilder.newOptions().withOption('bInfo', false);

				angular.extend(pc.dtPmOpts, {
					"columns": [
						{"width": "30%"}, null, null, null, null, null, null, null
					]
				});

				angular.extend(pc.dtCNVOpts, {
					"columns": [
						{"width": "30%"}, null, null, null
					]
				});

				// Remove first column when user is an oncologist
				if (pc.isOncologist && !pc.isOncologist) {
					pc.dtCNVOpts.columns.shift();
					pc.dtPmOpts.columns.shift();
				}

				angular.extend(pc.dtSVOpts, {
					"columns": [
						{"width": "40%"}, null
					]
				});

				angular.extend(pc.dtNGOpts, {
					"columns": [
						{"width": "10%"}, null
					]
				});

				var availableMethodologies = [1, 2, 3];
				var actionableDNAVariantTiers = [1, 2];
				var investigationalDNAVariantTiers = [3, 4];

				var availableLayoutVersions = [1, 2, 3];
				var availablePmTiers = [1, 2, 3, 4, 5];
				var availableNgCategories = ['PN', 'PLC', 'NPLC'];

				var patientDetailsBasePath = "scripts/app/dashboard/patients/patient-details";

				pc.getMethodology = function (panelversion) {
					if (availableMethodologies.indexOf(panelversion) > -1) {
						return patientDetailsBasePath + "/templates/oncopanel/methodology-v" + panelversion + ".html";
					} else {
						return patientDetailsBasePath + "/templates/oncopanel/methodology_notfound.html";
					}
				};

				pc.getContact = function () {
					return patientDetailsBasePath + "/templates/oncopanel/contact.html";
				};

				pc.getLayoutTooltipByVersion = function(id) {
					var pdf_version = this.patient.clinical.PDF_LAYOUT_VERSION;
					if (availableLayoutVersions.indexOf(pdf_version) === -1) {
						return;
					}

					return patientDetailsBasePath + "/tooltips/layout-v" + pdf_version + "/" + id + ".html";
				};

				pc.getNegativeGenomicsTooltip = function(category) {
					if (availableNgCategories.indexOf(category) === -1) {
						return;
					}

					return patientDetailsBasePath + "/tooltips/negative-genomics/" + category + ".html";
				};

				pc.getPointMutationTooltip = function(tier) {
					if (availablePmTiers.indexOf(+tier) === -1) {
						return;
					}

					return patientDetailsBasePath + "/tooltips/point-mutation/tier-" + tier + ".html";
				};
				
				pc.additionalMutationalSignatures = function(variants) {
					
					var specVariants = {
						APOBEC: variants.APOBEC_STATUS,
						POLE: variants.POLE_STATUS,
						TOBACCO: variants.TABACCO_STATUS,
						TEMOZOLOMIDE: variants.TEMOZOLOMIDE_STATUS,
						UVA: variants.UVA_STATUS
					};
					
					var specVariantsValues = _.reduce(specVariants, function(agg, val, key){
						if (val !== null && val.toLowerCase() === "yes") {
							agg.push(key);
						}
						return agg;
					}, []);
					
					var mutSigValues = _.values(specVariants);
					
					if (!_.isEmpty(specVariantsValues)) {
						return specVariantsValues.map(function(val) {
							return val + " signature was detected (see comment).";
						})
					} else if (_.every(mutSigValues, function(val){return val !== null && val.toLowerCase() === "insufficient variants"})) {
						return ["Too few mutations detected to perform additional mutational signature analysis."];
					} else if (_.every(mutSigValues, function(val){return val !== null && val.toLowerCase() === "no"})) {
						return ["Mutational signature analysis was performed, but no additional investigational signatures were detected."];
					} else if (_.every(mutSigValues, function(val){return val !== null && val.toLowerCase() === "cannot assess"})) {
						return ["Cannot assess."];
					} else {
						return ["Cannot assess."];
					}
				};

				var _handleSuccess = function (res) {
					$log.debug("Success Patients service ", res);
				};

				var _handleError = function (err) {
					$log.warn("An error occurred ", err);
					pc.isLoading = false;
				};

				pc.scrollToSection = function (section) {
					$log.debug("Scrolling to section ", section);
					var scrollSection = angular.element(document.getElementById(section));
					return $document.scrollToElementAnimated(scrollSection, 150, 500);
				};

				pc._queryGenomicByVariantCategory = function (pid, sample_id, variantCategory) {
					if (!pid) {
						return $q.reject("Missing patient identifier");
					}

					var queryObj = {};
					queryObj.CLINICAL_ID = pid;
					queryObj.SAMPLE_ID = sample_id;
					queryObj.VARIANT_CATEGORY = variantCategory;
					queryObj.WILDTYPE = false;

					return PatientsREST.queryGenomic({where: angular.toJson(queryObj)}, _handleSuccess, _handleError).$promise;
				};

				pc._queryImmunoprofileById = function(id) {
					if (!id) {
						return $q.reject("Missing patient id");
					}
					var queryObj = {};
					queryObj.clinical_id = id;

					return ImmunoprofileREST.queryImmunoprofile({where: angular.toJson(queryObj)}, _handleSuccess, _handleError).$promise;
				}

				pc._queryNegativeGenomic = function(pid, sample_id) {
					var q = {};
					q.clinical_id = pid;
					q.sample_id = sample_id;

					return NegativeGenomicREST.queryWhere({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Query RHP single nucleotide variants and small insertions/deletions
				 * @param pid
				 * @param sample_id
				 * @returns {*}
				 * @private
				 */
				pc._queryRHPVariants = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.WILDTYPE = false;
					q.VARIANT_CATEGORY = "MUTATION";
					q.PATHOGENICITY_PATHOLOGIST = "PATHOGENIC";

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Get all genes in RHP panel
				 */
				pc._queryRHPPanel = function () {
					return UtilitiesService.getPanel({panel: 'rapid heme panel'}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Get all RHP copy number variant genes
				 */
				pc._queryRHPCNVs = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.WILDTYPE = false;
					q.VARIANT_CATEGORY = "CNV";
					q.TRUE_HUGO_SYMBOL = {"$nin": ["IKZF1", "ERG", "KMT2A", "MLL"]};

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Get RHP CNV pertinent negatives to always display
				 */
				pc._queryRHPCNVPertNeg = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.WILDTYPE = false;
					q.VARIANT_CATEGORY = "CNV";
					q.TRUE_HUGO_SYMBOL = {"$in": ["IKZF1", "ERG", "KMT2A", "MLL"]};

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				pc._queryRHPFLT3 = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.WILDTYPE = false;
					q.TRUE_HUGO_SYMBOL = "FLT3";

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Query RHP variants of unknown significance
				 * @param pid
				 * @param sample_id
				 * @returns {*}
				 * @private
				 */
				pc._queryRHPVus = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.PATHOGENICITY_PATHOLOGIST = "VUS";

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				/**
				 * Query RHP variants of unknown significance
				 * @param pid
				 * @param sample_id
				 * @returns {*}
				 * @private
				 */
				pc._queryWildtypeCodon = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.WILDTYPE = true;

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				pc._queryInsufficientCoverage = function (pid, sample_id) {
					var q = {};
					q.CLINICAL_ID = pid;
					q.SAMPLE_ID = sample_id;
					q.TEST_NAME = "rapid heme panel";
					q.COVERAGE = {"$lt": 100};

					return PatientsREST.queryGenomic({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				pc.loadPatientDetails = function (patient) {
					pc.patient = {};
					pc.isLoading = true;
					pc.patient.clinical = patient;

					pc.vital_status = patient.VITAL_STATUS.toLowerCase();
					if (patient.TEST_NAME === "oncopanel") {
						pc.TEST_NAME = 'OncoPanel';
						pc.loadOncopanelDetails(patient)
					} else if (patient.TEST_NAME === "rapid heme panel") {
						pc.TEST_NAME = 'Rapid Heme Panel';
						pc.patient.rapidhemepanel = {};
						pc.selectedTab = 1;
						pc.loadRapidHemePanelDetails(patient)
					} else if (patient.TEST_NAME === "immunoprofile") {
						pc.TEST_NAME = 'ImmunoProfile';
						pc.selectedTab = 1;
						pc.patient.immunoprofile = {};
						pc.loadImmunoprofileDetails()
					}
				};

				pc.loadRapidHemePanelDetails = function (patient) {
					return $q.all([
						pc._queryRHPVariants(pid, patient.SAMPLE_ID),
						pc._queryRHPCNVs(pid, patient.SAMPLE_ID),
						pc._queryRHPCNVPertNeg(pid, patient.SAMPLE_ID),
						pc._queryRHPFLT3(pid, patient.SAMPLE_ID),
						pc._queryRHPVus(pid, patient.SAMPLE_ID),
						pc._queryWildtypeCodon(pid, patient.SAMPLE_ID),
						pc._queryInsufficientCoverage(pid, patient.SAMPLE_ID),
						pc._queryRHPPanel()
					])
						.spread(function (snvSids, cnvs, cnvsPertNegs, flt3, vus, wildtypeCodons, insufCov, genePanel) {
							pc.patient.rapidhemepanel.snvSid = snvSids._items;
							pc.patient.rapidhemepanel.cnvs = cnvs._items;
							pc.patient.rapidhemepanel.cnvsPertNegs = cnvsPertNegs._items;
							pc.patient.rapidhemepanel.flt3 = flt3._items;
							pc.patient.rapidhemepanel.vus = vus._items;
							pc.patient.rapidhemepanel.wildtypeCodons = wildtypeCodons._items;
							pc.patient.rapidhemepanel.insufCov = insufCov._items;
							pc.patient.rapidhemepanel.genePanel = genePanel.panel;

							//When displaying copy number analysis, always show pertinent negative
							//information by subtracting values present in current sample against
							//3 relevant genes for heme cancer.
							var cnvsPertNegsToRet = [];
							var pertNegs = ["TKZF1", "ERG", "KMT2A"];
							_.each(pertNegs, function (pertNeg) {
								var exists = false;
								_.each(pc.patient.rapidhemepanel.cnvsPertNegs, function (cnvPertNeg) {
									exists = true;
									if (pertNeg === cnvPertNeg.TRUE_HUGO_SYMBOL) {
										cnvsPertNegsToRet.push({
											"TRUE_HUGO_SYMBOL": pertNeg,
											"DETECTED": "Detected",
											"CNV_CALL": cnvPertNeg.CNV_CALL
										})
									} else {
										cnvsPertNegsToRet.push({
											"TRUE_HUGO_SYMBOL": pertNeg,
											"DETECTED": "Not Detected",
											"CNV_CALL": null
										})
									}
								});
								if (!exists) {
									cnvsPertNegsToRet.push({
										"TRUE_HUGO_SYMBOL": pertNeg,
										"DETECTED": "Not Detected",
										"CNV_CALL": null
									})
								}
							});
							pc.patient.rapidhemepanel.cnvsPertNegs = _.uniq(cnvsPertNegsToRet, 'TRUE_HUGO_SYMBOL');
							pc.isLoading = false;
						})
				};

				pc.loadOncopanelDetails = function (patient) {
					var sample_id = patient.SAMPLE_ID;

					// Fetch genomic data
					return $q.all([
						pc._queryGenomicByVariantCategory(pid, sample_id, 'CNV'),
						pc._queryGenomicByVariantCategory(pid, sample_id, 'MUTATION'),
						pc._queryGenomicByVariantCategory(pid, sample_id, 'SIGNATURE'),
						pc._queryGenomicByVariantCategory(pid, sample_id, 'SV'),
						pc._queryNegativeGenomic(pid, sample_id),
					])
						.spread(function (cnvMut, pmMut, sigMut, svMut, negGen) {
							/**
							 * Point mutation data
							 * Grouped by tier and sorted by Allele fraction
							 */
							pc.patient.actionableDNAVariants = {};
							pc.patient.additionalDNAVariants = {};
							pc.patient.negativeGenomics = {};
							pc.patient.additionalSignatures = sigMut._items;

							pc.hasAdditionalSignatures = pc.patient.additionalSignatures.length > 0;
							if (pc.hasAdditionalSignatures === true) {
								pc.hasAdditionalSignatures = false;
								for (var i = 0; i < pc.patient.additionalSignatures.length; i++) {
									var mutationalSignatureFields = [
										'TABACCO_STATUS',
										'TEMOZOLOMIDE_STATUS',
										'POLE_STATUS',
										'APOBEC_STATUS',
										'UVA_STATUS'
									];
									for (var j = 0; j < mutationalSignatureFields.length; j++) {
										if (pc.patient.additionalSignatures[i][mutationalSignatureFields[j]] !== undefined &&
											pc.patient.additionalSignatures[i][mutationalSignatureFields[j]] !== null) {
											pc.hasAdditionalSignatures = true;
										}
									}
								}
							}

							/**
							 * DNA Variants
							 */
								// Group by tier
							var muts = _.groupBy(pmMut._items, 'TIER');

							// Descending sort each tier by ALLELE_FRACTION
							_.each(muts, function (muts, tid) {
								if (actionableDNAVariantTiers.indexOf(Number(tid)) > -1) {
									// Actionable DNA Variants
									pc.patient.actionableDNAVariants[tid] = _.sortBy(muts,
										function (m) {
											return -m.ALLELE_FRACTION;
										}
									)
								} else if (investigationalDNAVariantTiers.indexOf(Number(tid)) > -1) {
									// Investigational DNA Variants
									pc.patient.additionalDNAVariants[tid] = _.sortBy(muts,
										function (m) {
											return -m.ALLELE_FRACTION;
										}
									)
								}
							});

							if (_.isEmpty(pc.patient.additionalDNAVariants)) {
								delete pc.patient.additionalDNAVariants;
							}

							if (_.isEmpty(pc.patient.actionableDNAVariants)) {
								delete pc.patient.actionableDNAVariants;
							}

							/**
							 * Process Negative genomics
							 * - Pertinent negatives (PN)
							 * - Pertinent insufficient coverage (PLC)
							 * - Additional insufficient coverage (NPLC)
							 */
							pc.patient.negativeGenomics = _.groupBy(negGen._items, 'coverage_type');
							pc.patient.transformedNegativeGenomics = {};

							var variantCategories = ['PN', 'PLC', 'NPLC'];

							_.each(variantCategories, function (cat) {
								// Process exons and codons for each variant category
								if (cat === 'PN' && pc.patient.negativeGenomics[cat] != undefined) {
									var t = {};
									for (var i = 0; i < pc.patient.negativeGenomics[cat].length; i++) {
										var item = pc.patient.negativeGenomics[cat][i];
										var symbol = item['true_hugo_symbol'] || item['camd_symbol'];

										// add gene
										if (!(symbol in t)) {
											t[symbol] = {
												'codons': [],
												'entire_gene': [],
												'entry': [],
												'exons': []
											};
										}

										// add regions
										if (item['show_codon'] === true) {
											t[symbol]['codons'].push(item['true_codon'])
										} else if (item['show_exon'] === true) {
											t[symbol]['exons'].push(item['true_transcript_exon'])
										} else if (item['entire_gene'] === true) {
											t[symbol]['entire_gene'].push(true)
										}

										t[symbol]['entry'].push(item);

									}

								} else {
									var t =
										_.chain(pc.patient.negativeGenomics[cat])
											.groupBy('true_hugo_symbol')
											.mapObject(function (value, key) {
												return {
													entry: value,
													codons: _(value).chain().flatten().pluck('true_codon').filter(function (tc) {
														return tc;
													}).unique().value(),
													exons: _(value).chain().flatten().pluck('true_transcript_exon').filter(function (tc) {
														return tc;
													}).unique().value(),
													entire_gene: _(value).chain().flatten().pluck('entire_gene').filter(function (tc) {
														return tc;
													}).unique().value()
												};
											}).value();
								}

								// sort
								for (var key in t) {
									t[key]['codons'].sort(function (a, b) {
										return a - b
									});
									t[key]['exons'].sort(function (a, b) {
										return a - b
									});
								}

								pc.patient.transformedNegativeGenomics[cat] = t;
							});

							// Structural variant data
							pc.patient.svMut = svMut._items;
							// Has SV filter match
							pc.hasSVFilterMatch = false;
							_.each(svMut._items, function (sv) {
								if (_.has(sv, 'FILTER')) {
									pc.hasSVFilterMatch = true;
								}
							});


							/**
							 * SV Structural Variants - Unstructured
							 */
							pc.patient.actionableSvMuts = svMut._items.filter(function (svMut) {
								return svMut.ACTIONABILITY === 'actionable';
							});

							pc.patient.additionalSvMuts = svMut._items.filter(function (svMut) {
								return svMut.ACTIONABILITY === 'investigational';
							});


							/**
							 * SV Structured Structural Variants
							 */
							pc.patient.actionableStructuredSV = svMut._items.filter(function (svMut) {
								return (svMut.ACTIONABILITY === 'actionable' || svMut.TIER === 1 || svMut.TIER === 2) && svMut.TIER !== null;
							});

							pc.patient.additionalStructuredSV = svMut._items.filter(function (svMut) {
								return (svMut.ACTIONABILITY === 'investigational' || svMut.TIER === 3 || svMut.TIER === 4) && svMut.TIER !== null;
							});

							pc.patient.additionalStructuredSV = _.groupBy(pc.patient.additionalStructuredSV, 'TIER');
							pc.patient.actionableStructuredSV = _.groupBy(pc.patient.actionableStructuredSV, 'TIER');

							if (_.isEmpty(pc.patient.additionalStructuredSV)) {
								delete pc.patient.additionalStructuredSV;
							}

							if (_.isEmpty(pc.patient.actionableStructuredSV)) {
								delete pc.patient.actionableStructuredSV;
							}


							/**
							 * CNV Copy Number Variations
							 */
							pc.patient.cnvMut = cnvMut._items;

							var actionableCnvMuts = cnvMut._items.filter(function (cnvMut) {
								return cnvMut.ACTIONABILITY === 'actionable';
							});

							var additionalCnvMuts = cnvMut._items.filter(function (cnvMut) {
								return cnvMut.ACTIONABILITY === 'investigational';
							});

							pc.patient.actionableCnvMut = groupByValue(actionableCnvMuts, 'CNV_ROW_ID');
							pc.patient.additionalCnvMut = groupByValue(additionalCnvMuts, 'CNV_ROW_ID');

							$log.debug("Patient clinical ", pc.patient);
							$log.debug("CNV data ", pc.patient.cnvMut);
							$log.debug("Structural variation data ", pc.patient.svMut);
							$log.debug("Negative genomics", pc.patient.negativeGenomics);
							pc.layout_version = pc.patient.clinical.PDF_LAYOUT_VERSION;
							pc.isLoading = false;
						});
				};

				pc.loadImmunoprofileDetails = function () {

					return $q.all([
						pc._queryImmunoprofileById(pid)
					])
						.spread(function (immunoprofile) {

						if (immunoprofile._items.length > 0) {
							pc.patient.immunoprofile = immunoprofile._items[0]
						}

						if (pc.patient.immunoprofile !== null && !pc.patient.immunoprofile.failed_sign_out) {
							var ip = pc.patient.immunoprofile;

							//PD-L1 table
							//tps
							pc.pd_l1_tps_score = pc.getBiomarker(ip.pdl1.scores, "tps");
							pc.pd_l1_tps_percentile_tumor = pc.getPercentile(ip.pdl1.scores.tps.percentile_tumor);
							pc.pd_l1_tps_percentile_total = pc.getPercentile(ip.pdl1.scores.tps.percentile_total);

							//cps
							pc.pd_l1_cps_score = pc.getBiomarker(ip.pdl1.scores, "cps");
							pc.pd_l1_cps_percentile_tumor = pc.getPercentile(ip.pdl1.scores.cps.percentile_tumor);
							pc.pd_l1_cps_percentile_total = pc.getPercentile(ip.pdl1.scores.cps.percentile_total);

							//ips (old inflammatory cells)
							if (ip.pdl1.scores.ips != undefined) {
								pc.pd_l1_ips_score = pc.getBiomarker(ip.pdl1.scores, "ips");
								pc.pd_l1_ips_percentile_tumor = pc.getPercentile(ip.pdl1.scores.ips.percentile_tumor);
								pc.pd_l1_ips_percentile_total = pc.getPercentile(ip.pdl1.scores.ips.percentile_total);
							}
							pc.ip_note_ips = pc.ipNoteIPS();
							

							//inflammatory cells area (breast cancer or v3)
							pc.ip_hide_pdl1_ica = pc.ipHidePDL1_ICA();
							if (ip.pdl1.scores.ica != undefined) {
								pc.pd_l1_ica_score = pc.getBiomarker(ip.pdl1.scores, "ica");
								pc.pd_l1_ica_percentile_tumor = pc.getPercentile(ip.pdl1.scores.ica.percentile_tumor);
								pc.pd_l1_ica_percentile_total = pc.getPercentile(ip.pdl1.scores.ica.percentile_total);
							}

							//Biomarkers table
							//cd8
							pc.bio_cd8_it_score = pc.getBiomarker(ip.biomarkers.cd8, "it");
							pc.bio_cd8_it_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8.it.percentile_tumor);
							pc.bio_cd8_it_percentile_total = pc.getPercentile(ip.biomarkers.cd8.it.percentile_total);
							pc.bio_cd8_tsi_score = pc.getBiomarker(ip.biomarkers.cd8, "tsi");
							pc.bio_cd8_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8.tsi.percentile_tumor);
							pc.bio_cd8_tsi_percentile_total = pc.getPercentile(ip.biomarkers.cd8.tsi.percentile_total);
							pc.bio_cd8_it_tsi_score = pc.getBiomarker(ip.biomarkers.cd8, "it_tsi");
							pc.bio_cd8_it_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8.it_tsi.percentile_tumor);
							pc.bio_cd8_it_tsi_percentile_total = pc.getPercentile(ip.biomarkers.cd8.it_tsi.percentile_total);

							//pd1
							pc.bio_pd1_it_score = pc.getBiomarker(ip.biomarkers.pd1, "it");
							pc.bio_pd1_it_percentile_tumor = pc.getPercentile(ip.biomarkers.pd1.it.percentile_tumor);
							pc.bio_pd1_it_percentile_total = pc.getPercentile(ip.biomarkers.pd1.it.percentile_total);
							pc.bio_pd1_tsi_score = pc.getBiomarker(ip.biomarkers.pd1, "tsi");
							pc.bio_pd1_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.pd1.tsi.percentile_tumor);
							pc.bio_pd1_tsi_percentile_total = pc.getPercentile(ip.biomarkers.pd1.tsi.percentile_total);
							pc.bio_pd1_it_tsi_score = pc.getBiomarker(ip.biomarkers.pd1, "it_tsi");
							pc.bio_pd1_it_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.pd1.it_tsi.percentile_tumor);
							pc.bio_pd1_it_tsi_percentile_total = pc.getPercentile(ip.biomarkers.pd1.it_tsi.percentile_total);

							//cd8 pd1
							pc.bio_cd8_pd1_it_score = pc.getBiomarker(ip.biomarkers.cd8_pd1, "it");
							pc.bio_cd8_pd1_it_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8_pd1.it.percentile_tumor);
							pc.bio_cd8_pd1_it_percentile_total = pc.getPercentile(ip.biomarkers.cd8_pd1.it.percentile_total);
							pc.bio_cd8_pd1_tsi_score = pc.getBiomarker(ip.biomarkers.cd8_pd1, "tsi");
							pc.bio_cd8_pd1_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8_pd1.tsi.percentile_tumor);
							pc.bio_cd8_pd1_tsi_percentile_total = pc.getPercentile(ip.biomarkers.cd8_pd1.tsi.percentile_total);
							pc.bio_cd8_pd1_it_tsi_score = pc.getBiomarker(ip.biomarkers.cd8_pd1, "it_tsi");
							pc.bio_cd8_pd1_it_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.cd8_pd1.it_tsi.percentile_tumor);
							pc.bio_cd8_pd1_it_tsi_percentile_total = pc.getPercentile(ip.biomarkers.cd8_pd1.it_tsi.percentile_total);

							//foxp3
							pc.bio_foxp3_it_score = pc.getBiomarker(ip.biomarkers.foxp3, "it");
							pc.bio_foxp3_it_percentile_tumor = pc.getPercentile(ip.biomarkers.foxp3.it.percentile_tumor);
							pc.bio_foxp3_it_percentile_total = pc.getPercentile(ip.biomarkers.foxp3.it.percentile_total);
							pc.bio_foxp3_tsi_score = pc.getBiomarker(ip.biomarkers.foxp3, "tsi");
							pc.bio_foxp3_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.foxp3.tsi.percentile_tumor);
							pc.bio_foxp3_tsi_percentile_total = pc.getPercentile(ip.biomarkers.foxp3.tsi.percentile_total);
							pc.bio_foxp3_it_tsi_score = pc.getBiomarker(ip.biomarkers.foxp3, "it_tsi");
							pc.bio_foxp3_it_tsi_percentile_tumor = pc.getPercentile(ip.biomarkers.foxp3.it_tsi.percentile_tumor);
							pc.bio_foxp3_it_tsi_percentile_total = pc.getPercentile(ip.biomarkers.foxp3.it_tsi.percentile_total);

							//reference comment
							pc.ip_reference_comment = pc.detectUrl(ip.pdl1.summary.interpretation_reference);
						}
						pc.isLoading = false;
					})
				};

				pc.includeForOncopanelVersion = function(version) {
					var v = parseInt(version);
					return this.patient.clinical.PDF_LAYOUT_VERSION === v;
				};

				pc.sampleSelect = function(patient) {
					// Patient has additional samples
					if (!!patient.RELATED && patient.RELATED.length > 0) {
						pc.sampleOptions = [];
						pc.sampleOptions = angular.copy(patient.RELATED);
						pc.sampleOptions.push(patient);

						$mdDialog.show({
							templateUrl: 'scripts/app/dashboard/patients/patient-search/sample-select/patient-sample-select.html',
							locals: {
								parent: pc,
								patient: patient
							},
							controller: angular.noop,
							controllerAs: 'ctrl',
							bindToController: true,
							clickOutsideToClose: true
						});
					}
				};

				pc.toggleBugCard = function() {
					$('#bug-report-card').slideToggle();
				};

				pc.goToRecord = function (pid) {
					$mdDialog.hide();
					pc.isLoading = true;
					$state.go('patient', {patient_id: pid});
				};

				if (!!patient) {
					pc.loadPatientDetails(patient);
					if (window.toPatientPage) {
						TrialMatchService.setMRN(patient.MRN);
					}
				}

				pc.toTitleCase = function (str) {
					if (str.toLowerCase() === 'oncopanel') {
						return 'OncoPanel'
					} else {
						str = str.toLowerCase().split(' ');
						for (var i = 0; i < str.length; i++) {
							str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
						}
						return str.join(' ');
					}
				};

				pc.getBiomarker = function (marker, type) {
					var biomarker;
					var stderr = marker[type].stderr === null ? 'N/A' : marker[type].stderr ;

					if (marker[type].value === 0 && type !== 'ica') {
						biomarker = '0 &plusmn; ' + stderr;
					} else if (marker[type].value === 0 && type === 'ica') {
						biomarker = marker[type].value;
					} else if (marker[type].value && marker[type].value !== undefined) {
						if (type === 'ica') {
							biomarker = marker[type].value;
						} else {
							biomarker = marker[type].value + ' &plusmn; ' + stderr;
						}
					} else {
						if (type === "tsi" || type === "it_tsi") {
							biomarker = "N/A*"
						} else {
							biomarker = "N/A"
						}
					}
					return biomarker
				};

				/***
				 * Detect URL's and format comment as list
				 * */
				pc.detectUrl = function (comment_str) {
					if (comment_str) {
						var comment_arr = comment_str.split('\n');

						if (comment_arr.length > 0) {
							var to_ret = "<ul>";
							var urlRegex =/(https?:\/\/[^\s]+)/ig;

							//find and format URL's into list elements
							for (var i = 0; i < comment_arr.length; i++) {
								var comment = comment_arr[i];
								//no URL's in epic
								if (comment && !ENV.EPIC) {
									comment = comment.replace(urlRegex, function (url) {
										return '<a href="' + url + '"  target="_blank">' + url + '</a>';
									});

									to_ret += "<li>" + comment + '</li><br/>'
								}
							}
							to_ret += "</ul>";
							return to_ret;
						}
					} else {
						return ""
					}
				};

				pc.ipHidePDL1_ICA = function () {
					var ip = pc.patient.immunoprofile;
					var ip_diag = pc.patient.clinical.IP_DIAGNOSIS;

					if ((ip.version == 1 || ip.version == 2) && ip_diag == 'Breast Cancer') {
						return false;
					}
					if (ip.version > 2) {
						return ip.pdl1.scores.ica.value === null;
					}
 					return true;
				}

				pc.ipNoteIPS = function () {
					var ip_v = pc.patient.immunoprofile.version;
					var ip_diag = pc.patient.clinical.IP_DIAGNOSIS;

					if (ip_diag == 'Lung Cancer' && ip_v == 2) {
						return true;
					}
					if (ip_diag == 'Bladder Cancer' && (
						ip_v == 1 || ip_v == 2)) {
						return true;
					}
					return false;
				}

				pc.getPercentile = function (num) {
					if (num || num === 0) {
						var j = num % 10,
						k = num % 100,
						ord = 'th';

						if (j === 1 && k !== 11) {
							ord = 'st'
						}
						if (j === 2 && k !== 12) {
							ord = 'nd'
						}
						if (j === 3 && k !== 13) {
							ord = 'rd'
						}

						return num.toString() + '<sup>' + ord + '</sup>'
					} else {
						return '-'
					}
				}
			}]);
