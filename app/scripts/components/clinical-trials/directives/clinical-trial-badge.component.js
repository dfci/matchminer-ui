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
 * @Title Clinical trial badge component
 * @Description A component showing contextual term based information of a clinical trial.
 * Badge color will be set based on the preset category types.
 * -----------------------------
 * - Gene Symbol :: Orange
 * - Tumor Type  :: Blue
 * - Stage       :: Dark green
 * - Age         :: Red
 * -----------------------------
 */
angular.module('matchminerUiApp')
    .component('clinicalTrialBadge', {
        templateUrl: 'scripts/components/clinical-trials/directives/clinical-trial-badge.html',
        controller: ClinicalTrialBadgeCtrl,
        bindings: {
            category: '@',
            prefix: '@',
            postfix: '@',
            value: '<',
            genomicObject: '<',
            clinicalObject: '<'
        }
    });

function ClinicalTrialBadgeCtrl() {
    var ctrl = this;
    ctrl.touched = false;

    // Transform negating badge values
    if (ctrl.value) {
        if (ctrl.value.charAt(0) == '!') {
            var s = ctrl.value;
            ctrl.view = 'NO ' + s.substr(1);
            ctrl.touched = true;
        }
    }

    if (ctrl.category === "age") {
        var decimalIndex = ctrl.value.indexOf(".");
        if (decimalIndex > -1) {
            var value = ctrl.value;
            var decimal = Number(value.slice(-value.length + decimalIndex));
            var timeMonths = Math.ceil(12 * decimal);
            ctrl.value = value.slice(0, -value.length + decimalIndex) + timeMonths;
            ctrl.postfix = (timeMonths === 1 ? 'month' : 'months');
        }
        if (!ctrl.postfix) {
            if (/\d/.test(ctrl.value)) {
                ctrl.postfix = "years";
            }
        }
    }

    if (ctrl.category == 'hugo_symbol' && ctrl.genomicObject) {
        var non_pc_modifier = true;
        var varCat = ctrl.genomicObject.variant_category;

        if (ctrl.genomicObject.protein_change || ctrl.genomicObject.wildcard_protein_change) {
            non_pc_modifier = false;
            ctrl.touched = true;

            var pl = "";
            var pc = ctrl.genomicObject.protein_change || ctrl.genomicObject.wildcard_protein_change;
            var transformed;

            if (pc.charAt(0) == '!') {
                transformed = true;
                pl = 'NO ' + pc.substr(1);
            }

            if (!transformed) {
                pl += ("" + pc);
            }

            ctrl.view = ctrl.value + " (" + pl + ")";
        }

        if (non_pc_modifier && (varCat == 'Mutation' || varCat == '!Mutation')) {
            var vc;

            if (ctrl.genomicObject.variant_classification) {
                vc = ctrl.genomicObject.variant_classification;
                vc = vc.replace(/_/g, " ");
            }

            if (vc) {
                ctrl.view = ctrl.value + " (" + vc + ")";
            } else {
                ctrl.view = ctrl.value;
            }
            ctrl.touched = true;
        }

        if (non_pc_modifier && ctrl.genomicObject.exon) {
            var vc;
            if (ctrl.genomicObject.variant_classification) {
                vc = ctrl.genomicObject.variant_classification;
                vc = vc.replace(/_/g, " ");
            }

            if (vc) {
                ctrl.view = ctrl.value + " (" + vc + " Exon " + ctrl.genomicObject.exon + ")";
            } else {
                ctrl.view = ctrl.value + " (Exon " + ctrl.genomicObject.exon + ")";
            }
            ctrl.touched = true;
        }

        if (varCat == 'Copy Number Variation' || varCat == "!Copy Number Variation") {
            ctrl.touched = true;
            ctrl.view = ctrl.value;

            if (ctrl.genomicObject.cnv_call) {
                ctrl.view = ctrl.value + " (" + ctrl.genomicObject.cnv_call + ")";
            }
        }

        if (varCat == 'Structural Variation' || varCat == "!Structural Variation") {
            ctrl.touched = true;
            ctrl.view = ctrl.value;

            var left = ctrl.genomicObject.hugo_symbol;
            var right = ctrl.genomicObject.fusion_partner_hugo_symbol;

            if (left == null || left === 'any_gene') {
                left = ''
            }

            if (right == null || right === 'any_gene') {
                right = ''
            }

            if (left.length !== 0 && right.length !== 0) {
                ctrl.view += " (" + left.toUpperCase() + '-' + right.toUpperCase() + ')'
            } else {
                if (left.length === 0 && right.length === 0) {
                    ctrl.view = 'ANY GENE'
                } else if (left.length === 0) {
                    ctrl.view = right.toUpperCase()
                } else if (right.length === 0) {
                    ctrl.view = left.toUpperCase()
                }
            }
        }

        /**
         * Wildtype prefix for criteria tree wildtype hugo symbols
         */
        if (ctrl.genomicObject.wildtype) {
            ctrl.touched = true;
            ctrl.view = "wt " + ctrl.value;
        }
    }

    if (ctrl.category == 'signatures' || ctrl.category === 'tmb') {
        ctrl.view = ctrl.value
    }

    if (ctrl.category == 'temozolomide_signature'
        || ctrl.category == 'tobacco_signature'
        || ctrl.category == 'pole_signature'
        || ctrl.category == 'apobec_signature'
        || ctrl.category == 'uva_signature') {

        //Do not display 'yes' when indicating inclusive
        if (ctrl.value == 'Yes') {
            ctrl.value = ' '
        } else {
            ctrl.value = 'NO'
        }
        ctrl.view = ctrl.value;
    }

    // Transform categorical Tumor Type / ONCOTREE_DIAGNOSIS values
    if (ctrl.category == 'tumor_type') {
        if (ctrl.value == '_SOLID_') {
            ctrl.view = 'All Solid Tumors';
            ctrl.touched = true;
        } else if (ctrl.value == '_LIQUID_') {
            ctrl.view = 'All Liquid Tumors';
            ctrl.touched = true;
        }

        if (ctrl.clinicalObject) {
            var co = ctrl.clinicalObject;
            var er_status, pr_status;

            if (!ctrl.touched) {
                ctrl.view = ctrl.value + " ";
            }

            // ER_STATUS
            if (co.er_status == "Positive" || co.er_status == "Negative") {
                ctrl.view += co.er_status == "Positive" ? "ER+" : "ER-";
                er_status = true;
            }

            // PR_STATUS
            if (co.pr_status == "Positive" || co.pr_status == "Negative") {
                if (er_status) {
                    ctrl.view += "/";
                }
                ctrl.view += co.pr_status == "Positive" ? "PR+" : "PR-";
                pr_status = true;
            }

            // HER2_STATUS
            if (co.her2_status == "Positive" || co.her2_status == "Negative") {
                if (er_status || pr_status) {
                    ctrl.view += "/";
                }
                ctrl.view += co.her2_status == "Positive" ? "HER2+" : "HER2-";
            }

            ctrl.touched = true;
        }

    }

    ctrl.class = getBadgeCategoryClass(ctrl.category, ctrl.value);
    ctrl.tooltip = getBadgeTooltip(ctrl.category);

    if ((ctrl.view != ctrl.value) && !ctrl.touched) {
        ctrl.view = ctrl.value;

        if (ctrl.category == 'status') {
            ctrl.view = ctrl.view.toUpperCase();
        }
    }

    return ctrl;
}

function getBadgeCategoryClass(category, status) {
    if (!category) return;

    var _trialGreenStatusses = ['OPEN TO ACCRUAL'];
    var _trialGreyStatusses = ['NEW', 'ON HOLD', 'SRC APPROVAL', 'IRB INITIAL APPROVAL', 'ACTIVATION COORDINATOR SIGNOFF'];
    var _trialYellowStatusses = ['CLOSED TO ACCRUAL', 'SUSPENDED'];
    var _trialRedStatusses = ['IRB STUDY CLOSURE', 'TERMINATED'];

    switch (category) {
        case 'signature':
        case 'temozolomide_signature':
        case 'tobacco_signature':
        case 'pole_signature':
        case 'apobec_signature':
        case 'tmb':
        case 'uva_signature':
            return 'ct-badge-signatures';
            break
        case 'hugo_symbol':
            return 'ct-badge-gene-symbol';
            break;
        case 'tumor_type':
            return 'ct-badge-tumor-type';
            break;
        case 'ms_status':
        case 'mmr_status':
            return 'ct-badge-signature-mutation';
            break;
        case 'disease_status':
            return 'ct-badge-stage';
            break;
        case 'age':
            return 'ct-badge-age';
            break;
        case 'phase':
            return 'ct-badge-phase';
            break;
        case 'drug':
            return 'ct-badge-drug';
            break;
        case 'variant_category':
            return 'ct-badge-variant-category';
            break;
        case 'cnv_call':
            return 'ct-badge-cnv-call';
            break;
        case 'status':
            status = status.toUpperCase();
            if (_trialGreenStatusses.indexOf(status) > -1) {
                return 'ct-badge-status-green';
            } else if (_trialGreyStatusses.indexOf(status) > -1) {
                return 'ct-badge-status-grey';
            } else if (_trialYellowStatusses.indexOf(status) > -1) {
                return 'ct-badge-status-yellow';
            } else if (_trialRedStatusses.indexOf(status) > -1) {
                return 'ct-badge-status-red';
            }
            break;
        default:
            return "no-class";
            break;
    }
}

function getBadgeTooltip(category) {
    if (!category) return;

    switch (category) {
        case 'signature':
        case 'temozolomide_signature':
        case 'tobacco_signature':
        case 'pole_signature':
        case 'apobec_signature':
        case 'uva_signature':
            return 'Signature';
            break
        case 'tmb':
            return 'TMB';
            break;
        case 'tumor_type':
            return 'Tumor type';
            break;
        case 'disease_status':
            return 'Disease status';
            break;
        case 'age':
            return 'Age';
            break;
        case 'ms_status':
        case 'mmr_status':
            return 'Mutational Signature';
            break;
        case 'hugo_symbol':
            return 'Gene';
            break;
        case 'phase':
            return 'Trial phase';
            break;
        case 'drug':
            return 'Drug';
            break;
        case 'variant_category':
            return 'Variant category';
            break;
        case 'cnv_call':
            return 'CNV call';
            break;
        default:
            return "";

    }
}
