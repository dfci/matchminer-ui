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
 * @name matchminerUiApp.controller: ClinicalTrialsResultsCtrl
 * @description
 * # ClinicalTrialsResultsCtrl
 * Controller of the clinical trials details
 */
angular.module('matchminerUiApp')
    .controller('ClinicalTrialsResultsCtrl', ['$scope', '$state', '$stateParams', '$timeout', 'ClinicalTrialsService', 'TrialMatchService', '$log', 'ToastService', 'trialSearch', 'trialMatches', 'uniqueFilter', 'ElasticSearchService', '$filter', 'ENV',
        function ($scope, $state, $stateParams, $timeout, ClinicalTrialsService, TrialMatchService, $log, ToastService, trialSearch, trialMatches, uniqueFilter, ElasticSearchService, $filter, ENV) {
            var ctr = this;

            ctr.isLoading = false;
            ctr.metadata = ClinicalTrialsService.getMetadata();
            ctr.sortOrder = '-trial_rank';
            ctr.oldSortOrder = '-trial_rank';
            ctr.uniqueRanks = {};
            ctr.searchTerm;
            ctr.allTrials = [];
            ctr.maxVisibleMatches = 5;
            ctr.institution = ENV.resources.institution;

            /**
             * Set the trials as injected by the clinicaltrials state resolve
             */
            if (trialMatches) {
                ctr.hasTrialMatches = true;
            } else {
                ctr.sortOrder = '';
                ctr.oldSortOrder = '';
            }

            if (trialMatches && trialMatches._items.length) {
                ctr.trialMatches = trialMatches._items;
                ctr.trialCoordinatorContacts = {};
            }

            if (trialSearch) {
                var trials = trialSearch.hits.hits;
                if (ctr.trialMatches) {
                    ctr.allTrials = trials;
                    ctr.trials = getPaginationLimitedTrials(trials);
                } else ctr.trials = trials;

                if (window.toPatientPage) {
                    TrialMatchService.setProtocolNos(ctr.trials.map(function (trial) {
                        return trial._source.protocol_no
                    }));
                }

                if (!TrialMatchService.getNumberOfTrialMatches()) {
                    TrialMatchService.setNumberOfTrialMatches(ctr.metadata.total_elements);
                }

                ctr.numberOfTrialMatches = TrialMatchService.getNumberOfTrialMatches();
            }

            /**
             * Check if we fetched trial matches for a patient
             */

            ctr.getTrialRankOrder = function (trial) {
                var index = _.findWhere(ctr.trialMatches, {protocol_no: trial._source.protocol_no});
                if (index) return index.sort_order;
                return '';
            }

            function getPaginationLimitedTrials(trials) {
                var isDesc = ctr.sortOrder[0] === '-';
                var size = ctr.metadata.page_size;
                var page = ctr.metadata.current_page;
                if (ctr.sortOrder.indexOf('trial_rank') > -1) {
                    var uniqueRanks;
                    if (_.isEmpty(ctr.uniqueRanks)) {
                        var ranks = ctr.trialMatches.map(function (item) {
                            return {protocol_no: item.protocol_no, rank: item.sort_order}
                        });
                        ctr.uniqueRanks = _.uniq(ranks, function (item) {
                            return item.protocol_no
                        }).reduce(function (obj, value) {
                            obj[value.protocol_no] = value.rank;
                            return obj;
                        }, {});
                    }
                    uniqueRanks = ctr.uniqueRanks;
                    trials.sort(function (a, b) {
                        return uniqueRanks[a._source.protocol_no] - uniqueRanks[b._source.protocol_no]
                    });
                }
                if (isDesc === false) trials.reverse();
                return trials.slice((page - 1) * size, page * size);
            }

            $scope.$watchCollection(
                function () {
                    return ClinicalTrialsService.getAll();
                },
                function (newTrials) {
                    if (newTrials !== undefined) {
                        if (ctr.trialMatches) {
                            var size = ctr.metadata.page_size;
                            var page = ctr.metadata.current_page;
                            if (ctr.sortOrder.indexOf('trial_rank') > -1) ctr.trials = getPaginationLimitedTrials(newTrials);
                            else ctr.trials = newTrials.slice((page - 1) * size, page * size);
                        }
                        if (!ctr.trialMatches) {
                            //dont need to set ctr.allTrials in this case
                            ctr.trials = newTrials;
                        }
                    }
                }
            );

            $scope.$watchCollection(
                function () {
                    return ClinicalTrialsService.getMetadata();
                },
                function (metadata) {
                    if (metadata !== undefined) {
                        ctr.metadata = metadata;
                    }
                }
            );

            $scope.$watch(
                function () {
                    return (ElasticSearchService.getGeneSearchTerm() || "") + " " + (ElasticSearchService.getTumorTypeSearchTerm() || "") + " " + (ElasticSearchService.getDiseaseCenterSearchTerm() || "") + " " + (ElasticSearchService.getSearchTerm() || "");
                },
                function (newTerm) {
                    ctr.searchTerm = newTerm.trim();
                }
            );

            $scope.$watch(
                function () {
                    return ElasticSearchService.getSearchSort();
                },
                function (newSort) {
                    if (newSort.length) {
                        /**
                         * Take the first sorting value as md data table
                         * can only apply single sorting as a column indicator.
                         */
                        _.mapObject(newSort[0], function (v, k) {
                            // Determine if the sort is ascending or descending.
                            ctr.sortOrder = v.order == 'desc' ? '-' : '';
                            ctr.sortOrder += k;
                        });
                    }
                }
            );

            $scope.$watch(
                function () {
                    return ClinicalTrialsService.isLoading;
                },
                function (isLoading) {
                    ctr.isLoading = isLoading;
                }
            );

            /**
             * Limit genomic matches
             */
            function filterProtocolMatches(trial, item) {
                return item.protocol_no === trial._source.protocol_no;
            }

            /**
             * Returns sorted matches
             */
            function getAllMatches(trial) {
                var matches = ctr.trialMatches;
                return _.uniq(matches.filter(filterProtocolMatches.bind(null, trial)), 'genomic_alteration');
            }

            /**
             * Sets trial.numberFilteredMatches based on "getFilteredMatches" by both "variant_type" and "genomic_alteration"
             */
            function updateFilteredMatches(trial, matches) {
                trial.numberFilteredMatches = matches.length;
                return sortMatches(matches);
            }

            /**
             * Sorts "getFilteredMatches" by both "variant_type" and "genomic_alteration"
             */
            function sortMatches(matches) {
                matches = _.partition(matches, function (match) {
                    return match.genomic_alteration.charAt(0) !== '!'
                });
                return _.flatten(matches.map(function (match) {
                    return _.sortBy(match, 'match_type').reverse()
                }))
            }

            /**
             * Toggles and sets "trial.numMatches"
             */
            ctr.toggleAllMatches = function (event, trial) {
                event.stopPropagation();
                trial.numMatches = trial.numMatches == 150 ? ctr.maxVisibleMatches : 150;
            };

            /**
             * Returns length of "getAllMatches"
             */
            ctr.numberAllMatches = function (trial) {
                if (trial.numberAllMatches) {
                    return trial.numberAllMatches;
                }
                trial.numberAllMatches = getAllMatches(trial).length;
                return trial.numberAllMatches;
            }

            /**
             * Returns filtered and sorted matches
             */
            ctr.getFilteredMatches = function (trial) {

                function filterGenomicAlt(item) {
                    return item.genomic_alteration.charAt(0) !== "!";
                }

                function filterMatchType(item) {
                    return item.match_type === "variant";
                }

                var protocolNumberMatches = getAllMatches(trial);

                if (trial.numMatches > ctr.maxVisibleMatches) {
                    return updateFilteredMatches(trial, protocolNumberMatches);
                }

                var genomicAltMatches = protocolNumberMatches.filter(filterGenomicAlt);

                if (genomicAltMatches.length > ctr.maxVisibleMatches) {
                    var matchTypeMatches = genomicAltMatches.filter(filterMatchType);
                    if (matchTypeMatches.length === 0) {
                        return updateFilteredMatches(trial, genomicAltMatches);
                    } else {
                        return updateFilteredMatches(trial, matchTypeMatches);
                    }
                } else if (genomicAltMatches.length === 0) {
                    var nonGenomicAltMatches = protocolNumberMatches.filter(filterMatchType);
                    if (nonGenomicAltMatches.length === 0) {
                        return updateFilteredMatches(trial, protocolNumberMatches);
                    } else {
                        return updateFilteredMatches(trial, nonGenomicAltMatches);
                    }
                } else {
                    return updateFilteredMatches(trial, protocolNumberMatches);
                }

            }

            /**
             * Handles whether "show all matches/show fewer matches" button shows
             */
            ctr.hasMoreMatches = function (trial) {
                if (!trial) return;
                return ctr.numberAllMatches(trial) > ctr.maxVisibleMatches;
            };

            /**
             * Handles text of "show all matches/show fewer matches" button
             */
            ctr.shouldShowAllMatches = function (trial) {
                return (trial.numMatches == ctr.maxVisibleMatches || !trial.numMatches)
            }

            /**
             * Returns number of matches for "show all matches" button
             */
            ctr.numberRemainingMatches = function (trial) {
                if (trial.numberFilteredMatches >= ctr.maxVisibleMatches) {
                    return ctr.numberAllMatches(trial) - ctr.maxVisibleMatches;
                }
                return ctr.numberAllMatches(trial) - trial.numberFilteredMatches;
            }

            /*
             * Handle sorting of md-data-table
             */
            ctr.onOrderChange = function (order) {
                var gmRegExp = new RegExp(/genomic_match/gi);
                var trRegExp = new RegExp(/trial_rank/gi);
                var isDesc = order.charAt(0) == '-';

                /**
                 * Handle clientside sorting based on genomic match.
                 * - Create genomic alterations / protocol_no pairs
                 * - Fetch the unique pairs
                 * - Alphabetically sort by genomic alteration
                 * - Sort available trials based on new order
                 */

                if (trRegExp.test(order)) {
                    ctr.trials = getPaginationLimitedTrials(ctr.allTrials);
                } else if (gmRegExp.test(order)) {
                    // Create trial matches alteration map
                    var pairs = _.map(ctr.trialMatches, function (tm) {
                        return {ga: tm.genomic_alteration, protocol_no: tm.protocol_no};
                    });
                    var protocolNos = _.uniq(_.pluck(pairs, 'protocol_no'));

                    // Sort each trial's genomic alterations and choose the alphabetical first
                    var uniqPairs = [];
                    protocolNos.forEach(function (protocolNo) {
                        var item = {};
                        item.protocol_no = protocolNo;
                        item.ga = _.pluck(_.where(pairs, {protocol_no: protocolNo}), 'ga').sort()[0].replace('!', '');
                        uniqPairs.push(item);
                    });

                    // Transform negating and sort unique pairs alphabetically on genomic alteration
                    var sortedUniq = _.sortBy(uniqPairs, function (p) {
                        return p.ga;
                    });

                    var newOrder = _.pluck(sortedUniq, 'protocol_no');
                    ctr.allTrials.sort(function (a, b) {
                        var oA = newOrder.indexOf(a._source.protocol_no);
                        var oB = newOrder.indexOf(b._source.protocol_no);
                        if (oA > oB) {
                            return 1;
                        }
                        if (oA < oB) {
                            return -1;
                        }
                        return 0;
                    });

                    ctr.trials = getPaginationLimitedTrials(ctr.allTrials);

                } else {
                    ctr.oldSortOrder = order;
                    return ClinicalTrialsService.sort(order);
                }
                ctr.oldSortOrder = order;
            };

            function extractObjectProperties(obj, word) {
                return word.split(".").reduce(function (agg, value) {
                    return agg[value];
                }, obj)
            }

            /*
             * Handle pagination of the md-data-table
             */
            ctr.onPaginationChange = function (page, limit) {
                if (ctr.hasTrialMatches) {
                    ClinicalTrialsService.paginate(page, limit, true).then(function (res) {
                        TrialMatchService.setProtocolNos(getPaginationLimitedTrials(res.hits.hits).map(function (trial) {
                            return trial._source.protocol_no;
                        }))
                    });
                    return ClinicalTrialsService.paginate(page, limit, true);
                } else {
                    ClinicalTrialsService.paginate(page, limit).then(function (res) {
                        TrialMatchService.setProtocolNos(res.hits.hits.map(function (trial) {
                            return trial._source.protocol_no
                        }))
                    });
                    return ClinicalTrialsService.paginate(page, limit);
                }
            };

            /**
             * Navigate to details page on row click
             * @param event
             * @param trial
             */
            ctr.navigateToDetails = function (event, trial) {
                if (ctr.hasTrialMatches) {
                    $state.go('patient-trial-match', {
                        patient_id: $stateParams.patient_id,
                        protocol_no: trial._source.protocol_no
                    });
                } else {
                    $state.go('clinicaltrials.detail', {protocol_no: trial._source.protocol_no});
                }
            };

            ctr.getHighlightContext = function (trial) {
                return ClinicalTrialsService.getHighlightContext(trial);
            };

            /**
             * Clinical trial badge methods
             */
            ctr.toggleAllTags = function (event, trial) {
                event.stopPropagation();
                var numTags = trial.numTags == 100 ? 3 : 100;
                trial.numTags = numTags;
            };

            /**
             * Check unique values of hugo_symbol, stages, drugs and primary diagnoses
             * if any of them have more them 3 values in a single trial
             * and return the results
             *
             * @param trial
             * @returns {boolean}
             */
            ctr.hasMoreTags = function (trial) {
                if (!trial) return;

                var hgsLen, wtHgsLen, stageLen, diagLen, drugLen, mutLength;
                var tS = trial._source;
                var hasMore = 1;

                if (tS._summary && tS._summary.nonsynonymous_genes) {
                    hgsLen = uniqueFilter(tS._summary.nonsynonymous_genes).length;
                    hasMore += hgsLen;
                }

                if (tS._summary && tS._summary.nonsynonymous_wt_genes) {
                    wtHgsLen = uniqueFilter(tS._summary.nonsynonymous_wt_genes).length;
                    hasMore += wtHgsLen;
                }

                if (tS._summary && tS._summary.disease_status) {
                    stageLen = tS._summary.disease_status.length;
                    hasMore += stageLen;
                }

                if (tS._summary && tS._summary.mutational_signatures) {
                    mutLength = tS._summary.mutational_signatures.length;
                    hasMore += mutLength;
                }

                if (tS._summary && tS._summary.tumor_types) {
                    var filtered = $filter('trialBadgeFilter')(tS._summary.tumor_types);
                    diagLen = uniqueFilter(filtered).length;
                    hasMore += diagLen;
                }

                if (tS.drug_list) {
                    if (tS.drug_list.drug != null) {
                        drugLen = uniqueFilter(tS.drug_list.drug, 'drug_name').length;
                    }
                }

                return (hgsLen > 3 || wtHgsLen > 3 || stageLen > 3 || diagLen > 3 || drugLen > 3 || mutLength > 3) || hasMore > 21;
            };

            /**
             * Parse the study coordinator for a trial from the staff_list
             * @param trial
             * @returns {Object}
             */
            ctr.getStudyCoordinator = function (trial) {
                return ClinicalTrialsService.getTrialCoordinator(trial);
            };

            /**
             * Email the study coordinator
             */
            ctr.emailTrialCoordinator = function (event, trial, coordinator_email) {
                return ClinicalTrialsService.emailCoordinator(event, trial, coordinator_email);
            };

            ctr.toTitleCase = function (str) {
                str = str.toLowerCase().split(' ');
                for (var i = 0; i < str.length; i++) {
                    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
                }
                return str.join(' ');
            };

        }]);
