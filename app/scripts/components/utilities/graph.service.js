'use strict';

/*
 * Utilities functions for graph elements.
 * @param Filter object holding the categories (genomic_filter, clinical_filter) and the match counts.
 */
angular.module('matchminerUiApp')
	.factory('GraphService', ['$log', function ($log) {
		var graphService = {};

		graphService.hideOrShow = function (filter) {
			/*
			 * Filter didn't yield results. Show text.
			 */
			if (filter.num_clinical == 0 && filter.num_genomic == 0) {
				$('#loadingPlot').hide();
				$('#filterPlot').hide();
				$('#histogramPlot').hide();
				$('#emptyPlot').hide();
				$('#plotResults').show();
				$('#noPlotData').show();
				$log.warn("[PLOT] No clinical or genomic matches. Hiding plot. ");
				return false;
			} else {
				$('#filterPlot').show();
				$('#histogramPlot').show();
				$('#emptyPlot').hide();
				$('#plotResults').hide();
				$('#noPlotData').hide();
			}

			return true;
		};

		return graphService;
	}]);
