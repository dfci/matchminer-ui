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
	.controller('EarlyAdopterCtrl',
		['$log', 'ENV', '$document', 'EmailsService',
			function ($log, ENV, $document, EmailsService) {
				var eac = this;

				eac.isLoading = false;
				eac.emailPosted = false;
				eac.error = false;

				eac.handleSubmit = function() {
					eac.isLoading = true;
					setTimeout(function() {
                        var email = document.getElementById('contact-email').value;
                        EmailsService.postEmail(email)
                            .then(function() {
                                eac.isLoading = false;
                                eac.emailPosted = true;
                            })
							.catch(function() {
                                eac.isLoading = false;
								eac.error = true;
                            })
					}, 1500);
				};

                eac.scrollToSection = function (section) {
                    var scrollSection = angular.element(document.getElementById(section));
                    return $document.scrollToElementAnimated(scrollSection, 20, 500);
                };

				eac.list = [
					{
						icon: 'label',
						question: 'What is the ‘Early Adopter’ Program?',
						answer: [
							"The ‘Early Adopter’ Program is a novel program at "+ ENV.resources.institution +" designed to facilitate interpretation of genomic profiling tests and patient-trial match identification, with the end goal of increasing enrollment to precision medicine clinical trials at "+ ENV.resources.institution +". To do this, we will identify a core set of oncologists, the ‘early adopters’ and set-up weekly review of patients and automatic notification of relevant patient-trial matches."
						]
					},
					{
						icon: 'storage',
						question: 'How will it work?',
						answer: [
							"We will aggregate scheduling information for each of the early adopters, and compute a set of patient-trials matches that encompasses:<br/>" +
							"<ol><li>Patients with new genomic profiling results</li>" +
							"<li>Patients with previous results that having an upcoming appointment within the next week</li></ol>" +
							"We will also build a predictive model of patient trial readiness and use this to display only relevant matches. The model will integrate scheduling data, treatment plan history, radiology scan results, lab results and clinician notes for each patient. ",
							"Throughout this process we plan to iterate and adapt our process in order to maximize the impact of the early adopter program. Overall impact will be measured by successful utilization and integration of the system by the early adopters and the number of patient-trial enrollments."
						]
					},
                    {
                        icon: 'report',
                        question: 'Sample Notification Report',
                        answer: []
                    },
					{
						icon: 'alarm',
						question: 'What is the expected time commitment?',
						answer: [
							"Involvement in the program will require attendance at an initial ‘kick-off’ meeting. Additionally, feedback and tracking will be key to the success of this program, and participation is required at regular monthly meetings with the entire group, where we will discuss general workflow integration and utilization. We will also capture direct feedback regarding the specific patient-trial matches being presented via weekly individual calls with a member of the MatchMiner team."
						]
					},
					{
						icon: 'person',
						question: 'Who should enroll?',
						answer: [
							"Anyone who is motivated to identify and enroll patients to precision medicine clinical trials at " + ENV.resources.institution + " is welcome to join."
						]
					}


				];

				return eac;
			}]);
