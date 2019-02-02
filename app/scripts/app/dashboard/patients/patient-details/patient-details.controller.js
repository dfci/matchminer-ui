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
		['$scope', '$stateParams', '$q', '$log', '$state', 'PatientsREST', 'ToastService', 'DTOptionsBuilder', 'TEMPLATES', '$document', '$mdMedia', '$mdDialog', 'deviceDetector', 'patient', 'ClinicalTrialsService', 'NegativeGenomicREST', 'TrialMatchService', 'UserAccount', '$window', 'ENV',
			function ($scope, $stateParams, $q, $log, $state, PatientsREST, ToastService, DTOptionsBuilder, TEMPLATES, $document, $mdMedia, $mdDialog, deviceDetector, patient, ClinicalTrialsService, NegativeGenomicREST, TrialMatchService, UserAccount, $window, ENV) {
				var pc = this;
				pc.sidebarScroll = 0;
				pc.TEMPLATES = TEMPLATES.patient_view;

				pc.isCti = UserAccount.roles.indexOf('cti') > -1;
				pc.isOncologist = UserAccount.roles.indexOf('oncologist') > -1;
				pc.resize = true;

				if (pc.patient) {
					ClinicalTrialsService.setMRN(pc.patient.clinical.MRN);
				}

                var lastWidth, currentWidth, initialWidth, lastScroll, currentScroll, scrollReset, recentSidebarSwitch;
                lastWidth = currentWidth = initialWidth = $window.innerWidth;
                lastScroll = currentScroll = 0;
                scrollReset = recentSidebarSwitch = true;

                pc.showAnyFilters = function(cnvs) {
                    return _.some(cnvs, function(cnv) {return cnv.FILTER && cnv.FILTER.length > 0});
                }

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
                        // checkSidebarSpacingScroll(lastScroll, currentScroll);
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

				var dtBaseOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');

				pc.dtPmOpts = angular.copy(dtBaseOptions);
				pc.dtCNVOpts = DTOptionsBuilder.newOptions().withOption('order', []).withPaginationType('full_numbers');
				pc.dtAltCNVOpts = angular.copy(dtBaseOptions);
				pc.dtSVOpts = angular.copy(dtBaseOptions);
				pc.dtNGOpts = angular.copy(dtBaseOptions);

				angular.extend(pc.dtPmOpts, {
					"columns": [
						{"width": "20%"}, null, null, null, null, null, null, null
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

				var availableLayoutVersions = [1, 2];
				var availablePmTiers = [1, 2, 3, 4, 5];
				var availableNgCategories = ['PN', 'PLC', 'NPLC'];

				var patientDetailsBasePath = "scripts/app/dashboard/patients/patient-details";

				pc.getMethodology = function (panelversion) {
					if (availableMethodologies.indexOf(panelversion) > -1) {
						return patientDetailsBasePath + "/templates/methodology-v" + panelversion + ".html";
					} else {
						return patientDetailsBasePath + "/templates/methodology_notfound.html";
					}
				};

				pc.getContact = function () {
					return patientDetailsBasePath + "/templates/contact.html";
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
						UVA: variants.UVA_STATUS,
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
					queryObj.SAMPLE_ID = sample_id;

					return PatientsREST.queryGenomic({where: angular.toJson(queryObj)}, _handleSuccess, _handleError).$promise;
				};

				pc._queryNegativeGenomic = function(pid, sample_id) {
					var q = {};
					q.clinical_id = pid;
					q.sample_id = sample_id;

					return NegativeGenomicREST.queryWhere({where: angular.toJson(q)}, _handleSuccess, _handleError).$promise;
				};

				pc.loadPatientDetails = function (patient) {
					pc.patient = {};
					pc.isLoading = true;

					// Clinical data
					pc.patient.clinical = patient;
					var sample_id = patient.SAMPLE_ID;

					// Fetch CNV
					// Fetch DNA Variants
					// Fetch Structural variation
					return $q.all([
							pc._queryGenomicByVariantCategory(pid, sample_id, 'CNV'),
							pc._queryGenomicByVariantCategory(pid, sample_id, 'MUTATION'),
							pc._queryGenomicByVariantCategory(pid, sample_id, 'SIGNATURE'),
							pc._queryGenomicByVariantCategory(pid, sample_id, 'SV'),
							pc._queryNegativeGenomic(pid, sample_id)
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
							    for (var i=0; i < pc.patient.additionalSignatures.length; i++) {
							        var mutationalSignatureFields = [
							            'TABACCO_STATUS',
                                        'TEMOZOLOMIDE_STATUS',
                                        'POLE_STATUS',
                                        'APOBEC_STATUS',
                                        'UVA_STATUS',
							        ];
							        for (var j=0; j < mutationalSignatureFields.length; j++) {
							            if (pc.patient.additionalSignatures[i][mutationalSignatureFields[j]] !== undefined &&
							                pc.patient.additionalSignatures[i][mutationalSignatureFields[j]] !== null) {
                                                console.log(mutationalSignatureFields[j], pc.patient.additionalSignatures[i][mutationalSignatureFields[j]]);
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

							_.each(variantCategories, function(cat) {
								// Process exons and codons for each variant category
								if (cat === 'PN' && pc.patient.negativeGenomics[cat] != undefined) {
                                    var t = {};
                                    for (var i=0; i < pc.patient.negativeGenomics[cat].length; i++) {
                                        var item = pc.patient.negativeGenomics[cat][i];

                                        // add gene
                                        if (!(item['true_hugo_symbol'] in t)) {
                                            t[item['true_hugo_symbol']] = {
                                                'codons': [],
                                                'entire_gene': [],
                                                'entry': [],
                                                'exons': []
                                            };
                                        }

                                        // add regions
                                        if (item['show_codon'] === true) {
                                            t[item['true_hugo_symbol']]['codons'].push(item['true_codon'])
                                        } else if (item['show_exon'] === true) {
                                            t[item['true_hugo_symbol']]['exons'].push(item['true_transcript_exon'])
                                        } else if (item['entire_gene'] ===  true) {
                                            t[item['true_hugo_symbol']]['entire_gene'].push(true)
                                        }

                                        t[item['true_hugo_symbol']]['entry'].push(item);

                                    }

								} else {
                                    var t =
                                        _.chain(pc.patient.negativeGenomics[cat])
                                            .groupBy('true_hugo_symbol')
                                            .mapObject(function(value, key) {
                                                return {
                                                    entry: value,
                                                    codons: _(value).chain().flatten().pluck('true_codon').filter(function(tc) {
                                                        return tc;
                                                    }).unique().value(),
                                                    exons: _(value).chain().flatten().pluck('true_transcript_exon').filter(function(tc) {
                                                        return tc;
                                                    }).unique().value(),
                                                    entire_gene: _(value).chain().flatten().pluck('entire_gene').filter(function(tc) {
                                                        return tc;
                                                    }).unique().value()
                                                };
                                            }).value();
                                    }

                                // sort
                                for (var key in t) {
                                    t[key]['codons'].sort(function(a,b){return a - b});
                                    t[key]['exons'].sort(function(a,b){return a - b});
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

							pc.patient.actionableSvMuts = svMut._items.filter(function(svMut) {
								return svMut.ACTIONABILITY === 'actionable';
							});

							pc.patient.additionalSvMuts = svMut._items.filter(function(svMut) {
								return svMut.ACTIONABILITY === 'investigational';
							});

							pc.patient.cnvMut = cnvMut._items;
							var actionableCnvMuts = cnvMut._items.filter(function(cnvMut) {
								return cnvMut.ACTIONABILITY === 'actionable';
							});

							var additionalCnvMuts = cnvMut._items.filter(function(cnvMut) {
								return cnvMut.ACTIONABILITY === 'investigational';
							});

							pc.patient.actionableCnvMut = groupByValue(actionableCnvMuts, 'CNV_ROW_ID');
							pc.patient.additionalCnvMut = groupByValue(additionalCnvMuts, 'CNV_ROW_ID');

							$log.debug("Patient clinical ", pc.patient );
							$log.debug("CNV data ", pc.patient.cnvMut);
							$log.debug("Structural variation data ", pc.patient.svMut);
							$log.debug("Negative genomics", pc.patient.negativeGenomics);
							pc.layout_version = pc.patient.clinical.PDF_LAYOUT_VERSION;
							pc.isLoading = false;
						});
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

			}]);
