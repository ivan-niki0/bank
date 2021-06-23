var APP = APP || {};

APP.contentDisplay = APP.contentDisplay || (function () {
	'use strict';

	var $body,
		$mainContainer,
		$chartContainer,
		$textContainer,
		$text,
		closeButtonId;

	function init() {
		$body = $('body');
		$mainContainer = $('#main');
		$chartContainer = $('#chart-graphic');
		$textContainer = $('#chart-item-text');
		$text = $('#chart-item-text > .decor');
		closeButtonId = '#chart-item-text-close';
		setupChartEvents();
	}

	function getData(evt) {
		var $link = $(this),
			path = $link.attr('href'),
			requestUrl = '/umbraco/surface/subpagecontent/renderbyroute?route=' + path;

		$.get(requestUrl, jobInfoLoaded);

		return false;
	}

	function jobInfoLoaded(data) {
		removePanelEvents();
		$text.html('<span id="chart-item-text-close" class="close icon">Close</span>' + data).slideDown();
		$mainContainer.addClass('has-chart-item');

		if ($body.hasClass('is-mobile')) {
			$('html, body').animate({
				scrollTop: $textContainer.offset().top
			}, 600);
		}

		setupPanelEvents();
	}

	function setupChartEvents() {
		$('.chart-item-link').on('click', getData);
	}

	function setupPanelEvents() {
		$(closeButtonId).on('click', function () {
			$text.slideUp();
			$mainContainer.removeClass('has-chart-item');
		});
	}

	function removePanelEvents() {
		$(closeButtonId).off('click');
	}

	return {
		init: init
	};
}());

APP.scrollBar = APP.scrollBar || (function () {
	'use strict';

	function doScrollBar() {
		var $scrollWindow;

		if ($('body').hasClass('is-mobile')) {
			return;
		}

		$scrollWindow = $('.m-chart .graphics');
		
		$scrollWindow.mCustomScrollbar({
			axis: 'x',
			scrollbarPosition: 'outside',
			scrollButtons: {
				enable: false
			},
			advanced: {
				updateOnContentResize: true,
				updateOnBrowserResize: true
			}
		});
	}
	return {
		init: doScrollBar
	};
}());

$(document).ready(function () {
	'use strict';

	APP.contentDisplay.init();
	APP.scrollBar.init();
});