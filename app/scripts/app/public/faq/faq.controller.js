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
 * @name matchminerUiApp.controller:ClinicianResponseCtrl
 * @description
 * # ClinicianResponseCtrl
 * Controller of the matchminerUiApp
 */
angular.module('matchminerUiApp')
	.controller('FaqCtrl',
		['$log', 'ENV',
			function ($log, ENV) {
				var fc = this;

				fc.faqList = [
					{
						icon: 'label',
						question: 'What is MatchMiner?',
						answer: [
							'MatchMiner is a computational platform for matching genomic profiles to open clinical trials at <b>' + ENV.resources.institutionFull +'</b>.',
							'It currently provides the following features: <br />' +
							'<ul><li><b>Trial Search: </b>For example, one can easily identify all '+ ENV.resources.institution +' trials requiring a BRAF or EGFR mutation, and further filter by cancer type.  Trial search is open to all, and does not require a user name or password.  Trial search is based on extensive genomic curation of precision medicine clinical trials currently active at '+ ENV.resources.institution + '.</li>' +
							'<li><b>Patient-Specific Matching for Precision Medicine Clinical Trials: </b>For example, oncologists can search for a patient and view genomically-matched clinical trials currently active at '+ ENV.resources.institution +'.</li>' +
							'<li><b>Patient Recruitment for Specific Clinical Trials: </b>For example, clinical trial investigators can identify patients with a specific genomic alteration and get automatic email notifications of new patients.  Patient identification and notification is only available to approved clinical trial investigators.  To apply for access, complete the <a class="faq-link" href="http://bit.ly/matchminer-apply" target="_blank"> online registration form.</a>.</li></ul>'
						]
					},
					{
						icon: 'storage',
						question: 'Where does the genomic data in MatchMiner come from?',
						answer: [
							'MatchMiner automatically imports all genomic data from the Profile Sequencing project (11-104 '+ ENV.resources.institution +' Protocol). MatchMiner automatically imports all genomic data twice weekly.'
						]
					},
					{
						icon: 'assignment',
						question: 'What Clinical Trials are currently in MatchMiner?',
						answer: [
							'MatchMiner includes precision medicine clinical trials currently active at '+ ENV.resources.institution +'.  This specifically includes any active clinical trial that lists a genomic biomarker, such as a gene mutation or copy number alteration, as required eligibility criteria.  Because we manually curate each trial, we do not currently include or curate trials beyond ' + ENV.resources.institution + '.'
						]
					},
					{
						icon: 'lock',
						question: 'Who can access MatchMiner?',
						answer: [
							'We currently maintain three levels of access:',
							'<ul><li><b>Trial Search is open to all, </b>and does not require a user name or password.</li>'
							+ '<li><b>Patient-Centric Matching is available to all Oncologists who currently have access to Profile reports via OncoPanel Results Viewer. </b>The approved user list is automatically synced on a nightly basis. </li>'
							+ '<li><b>Patient identification and notification is only available to approved clinical trial investigators. </b> To apply for access, complete the <a class="faq-link" href="http://bit.ly/matchminer-apply" target="_blank"> online registration form</a>.  Access approval is granted by the '+ ENV.resources.institution +' Chief Clinical Officer, Bruce Johnson.</li></ul>'
						]
					},
					{
						icon: 'bug_report',
						question: 'I found a bug or would like to suggest a feature. Who do I contact?',
						answer: [
							'Please send an email to <a class="faq-link" href="mailto:'+ ENV.resources.email +'" target="_top">'+ ENV.resources.email +'</a>'
						]
					},
					{
						icon: 'help',
						question: 'I need help! Who do I contact?',
						answer: [
                            'Please send an email to <a class="faq-link" href="mailto:'+ ENV.resources.email +'" target="_top">'+ ENV.resources.email +'</a>'
						]
					}
				];

				return fc;
			}]);
