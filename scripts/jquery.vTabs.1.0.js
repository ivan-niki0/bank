/*!
 * jQuery Tabs Plugin
 * 
 * - Updates the URL and is indexable, as long as the browser suports the history API and indexable is set to true
 * - Defaults to first tab if wrong or old url hash is supplied
 */

;(function ($) {
    if (!$.APP) {
        $.APP = {};
    }

    $.APP.vTabs = function (el, options) {
        // To avoid scope issues, use "base" instead of "this"
        // to reference this class from internal events and functions.
        var base = this,
			urlHash = location.hash,
			headingTab = $('.module-header a'),
			contentTab = $('.module-canvas .tab-content'),
			hrefsArr = [],
			hashExsists;

        // Access to jQuery and DOM versions of element
        base.$el = $(el),
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("APP.vTabs", base);

        base.init = function () {

            base.options = $.extend({}, $.APP.vTabs.defaultOptions, options);

            // Initialise functions!!
            base.doesHashExsist();
            base.selectTabs();
            base.onTabClick();
            base.hashChange();
        };

        ///////
        // Main Functions...
        ///////
        base.selectTabs = function () {
			// Show first tab content, if no url hash
			if (base.options.indexable === true) {
				if (urlHash && hashExsists === true) {
					$(urlHash).addClass('selected'); // Add class to item whoms id is the same as the urlHash
					$("a[href='" + urlHash + "']").addClass('selected'); // Add class to item whoms href is the same as the urlHash
				} else {
					selectFirst(contentTab);
					selectFirst(headingTab);
				}
			} else {
				selectFirst(contentTab);
				selectFirst(headingTab);
			}
		};

		base.onTabClick = function () {
			headingTab.on('click', function (e, data) {
				var href = $(this).attr('href');
				changeTabAndHash($(this));
				if ($('body').hasClass('doctype-homepage') && data !== 'auto') {
					APP.homepageTabs.stop();
				}
				e.preventDefault();
			});
		};

		// Check if the given location.hash exsists, if it doesn't show first item.
		base.doesHashExsist = function () {
			if (base.options.indexable === true) {
				headingTab.each(function () {
					var href = $(this).attr('href');
					hrefsArr.push(href); // Create the array of hrefs to check against
				});
				if (($.inArray(urlHash, hrefsArr)) !== -1) {
				//if (hrefsArr.inArray(urlHash) !== -1) { // if hash is in array
					hashExsists = true;
				} else {
					hashExsists = false;
				}
			}
		};

		base.hashChange = function () {
			// if browser supports hashchange and we want this to be indexable
			if (history.pushState && base.options.indexable === true) {
				$(window).bind("hashchange", function () {
					urlHash = location.hash; // update urlHash
					base.doesHashExsist(); // Check if it exsists on the page
					// Change tab when browsers back or forward button is clicked
					if (hashExsists === true) {
						changeTab($("a[href='" + urlHash + "']")); // Go to appropriate tab
					} else {
						selectThis(headingTab.eq(0), contentTab.eq(0)); // Else go to first one
					}
				});
			}
		};

		///////
        // Helper Functions...
        ///////

		function changeTabAndHash($el) {
			var id = $el.attr('href');
			if (history.pushState && base.options.indexable === true) {
				// Update hash
				history.pushState(null, null, id);
				// window.location.hash = id;
				selectThis($el, id);
			} else {
				// simply switch tab
				selectThis($el, id);
			}
		}

		function changeTab($el) {
			var id = $el.attr('href');
			selectThis($el, id);
		}

		// Select First tab and content item
		function selectFirst($el) {
			$el.eq(0).addClass('selected');
		}

		// Select the item being clicked
		function selectThis($el, id) {
			$('.selected').removeClass('selected');
			$el.addClass('selected');
			$(id).addClass('selected');
		}

        base.init();
    };

    $.APP.vTabs.defaultOptions = {
		indexable: true
    };

    $.fn.APP_vTabs = function
        (options) {
        return this.each(function () {
            (new $.APP.vTabs(this, options));
        });
    };

})(jQuery);

var APP = APP || {};
APP.homepageTabs = APP.homepageTabs || (function () {
	'use strict';
	var btns,
		currentBtn,
		currentCycle,
		maxCycles,
		repeater,
		interval;

	function showNext() {
		currentBtn += 1;
		if (currentBtn >= btns.length) {
			currentBtn = 0;
			currentCycle += 1;
		}
		if (currentCycle >= maxCycles) {
			stopRepeater();
		}
		$(btns[currentBtn]).trigger('click', 'auto');
	}

	function startRepeater() {
		repeater = setInterval(showNext, interval);
	}

	function stopRepeater() {
		clearInterval(repeater);
	}

	function resetTimeElapsed() {
		stopRepeater();
		startRepeater();
	}

	function init() {
		currentBtn = 0;
		currentCycle = 0;
		maxCycles = 2;
		btns = $('.m-tabs .module-header a');
		interval = 1000 * 6;
		startRepeater();
	}

	return {
		init: init,
		resetTimeElapsed: resetTimeElapsed,
		stop: stopRepeater
	};
}());

$(document).ready(function () {
	'use strict';

	$('.m-tabs, .m-content-tabs').APP_vTabs({
		indexable: true
	});

	if ($('body').hasClass('doctype-homepage') && window.location.hash === '') {
		// cycle through homepage tabs if not on a hash url
		APP.homepageTabs.init();
	}
});