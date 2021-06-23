/******************************************************************************************

	This accordion plugin is designed to work with minimal markup. By default
	it is set up to use Definition Lists, but it's designed to work with any markup,
	as long as it has a container with a class of "accordion".

	If you want to use defferent markup you can specify the 'header' and 'content' selectors
	in the settings of the plugin.

	This plugin relies on jQuery.1.9.1.js.
	Tested and working in ie7+ and all good browsers

	** To do... **
		Test with older version of jQuery
		Add CSS resets for other markup, ul/li's, H2's etc
		Give example of individual easing functions

	Dan Voyce.

	v1.1 Dan Leach 2013-12
		More robust checking of open items.

	v1.2 Muhenda Bagenda 2013-12
		Add accordion switching support for video to stop video on close and optionally start video playing on accordion open.

	v1.4 Muhenda Bagenda 2014-9
		Change method event handler is attached to header click event to allow the event handler to easily be removed using Jquery off() function.
		Previously used click(), now uses .on('click',function).


*******************************************************************************************/

(function ($) {
	$.fn.vAccordion = function (options) {

		var defaults = { // Plugin default options
				header: 'dt', // Default header selector
				content: 'dd', // Default content selector
				duration: 500, // Default animation duration
				easing: 'linear', // If you use anything other than this, you need to include the jquery easing plugin or individual parts of it.
				firstOpen: false, // Is the first content area open?
				browserNavigation: true, // Enable Forward and Back button to navigate the accordion and update the URL
				videoSupport: false, // Enable video playing and pausing as you change accordion items. Only one video will play at a time. Video elements must have unique ids.
				videoAutoPlay: false //Autoplay video on accordion item switch (Requires video support)
			},
			$base = $(this),
			url,
			urlArr,
			lastEl,
			urlHash = '',
			elPos,
			scrollPos,
			tP = parseInt($(options.content).css('padding-top'), 10),
			rP = parseInt($(options.content).css('padding-right'), 10),
			bP = parseInt($(options.content).css('padding-bottom'), 10),
			lP = parseInt($(options.content).css('padding-left'), 10),
			bBW = $(options.header).css('border-bottom-width'),
			bBS = $(options.header).css('border-bottom-style'),
			bBC = $(options.header).css('border-bottom-color'),
			border = bBW + ' ' + bBS + ' ' + bBC; // Need to get these all seperately because ie7 and 8 doesn't understand just 'border-bottom'.

		options = $.extend(defaults, options); // Merge default and user defined options

		assignHrefAndIDVal($(this));

		// if the URL contains a hash value, set urlHash to this, else it remains null
		if (location.hash) {
			//urlHash = sanitise(window.location.hash); // TODO: DANGER! XSS VULNERABILITY! Sanitise this before assignment.
			urlHash = window.location.hash; // TODO: DANGER! XSS VULNERABILITY! Sanitise this before assignment.
			scrollToAnchor();
		}

		// if browser supports hashchange AND if browserNavigation setting = true... 
		if (Modernizr.hashchange && options.browserNavigation === true) {
			$(window).bind('hashchange', onUrlHashChange); // trigger hashchange function
		}

		// For each Accordion Module on the page...
		return this.each(function () {
			var header = $(this).find(options.header), // Define header / click handler;
				firstChild = $(':first', this).children(options.content),
				firstChildID = firstChild.attr('id'); // FirstChild

			$(this)
				.find(options.content)
				.each(function () {
					var el = this;
					storeHeight(this);
					$(window).on('resize', function () {
						storeHeight(el);
					});
				});

			header.on('click', $(this), onClick); // Initiate the onClick function

			header
				.css('cursor', 'pointer') // Give the header / click handler the appropriate cursor
				.next().each(resetContent); // Reset (hide) each content block

			if (options.firstOpen === true && !urlHash) { // if 'firstOpen' option is true, open the accordion item on load AND urlHash has no value
				showContent(firstChild);
				firstChild.parent().addClass('open');
				window.location.hash = firstChildID;
			} else if (urlHash) {
				$(urlHash).parent().addClass('open');
			}

			haveEasing();
		});

		function onClick(event) {
			var content = $(this).next(options.content);

			if (options.videoSupport === true) {

				var $currentVideo = content.find('video'),
					$currentVideoID;

				if($currentVideo.length) {

					$currentVideoID = $currentVideo.attr('id');

					//Play current video
					if (options.videoAutoPlay === true) {
						MEDIA_CONTROL.play($currentVideoID);
					}

					//Pause video before closing accordion item if no other accordion item is clicked to opened
					if($(this).parent().hasClass('open')) {
						MEDIA_CONTROL.pause($currentVideoID);
					}

					//Pause all but current video
					(function () {
						var videoIds = [];

						$base.find('video').not($currentVideo).each(
							function(){
								videoIds.push(this.id);
								MEDIA_CONTROL.pause(this.id);
							}
						);
					})();
				}
			}

			scrollPos = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			if (/\bopen\b/.test(event.currentTarget.parentElement.className)) { // Does this (header/toggle) have a class of 'open'
				hideContent(); // Initiate hideContent function
				if (options.browserNavigation === true) {
					urlHash = '';
					window.location.hash = urlHash;
				}
			} else if (!Modernizr.hashchange || options.browserNavigation === false) { // if browser does NOT support hashchange OR browserNavigation setting = false... 
				hideContent(); // Initiate hideContent function
				showContent(content); // Initiate showContent function
				setTimeout(function () {
					$('html,body').animate({
						scrollTop: $(event.currentTarget.parentElement).offset().top
					});
				}, 300);
			} else if (Modernizr.hashchange && options.browserNavigation === true) { // if browser supports hashchange AND if browserNavigation setting = true...
				urlHash = event.currentTarget.hash; // TODO: DANGER! XSS VULNERABILITY! Sanitise this before assignment.
				window.location.hash = urlHash; // Update the window location to match the href
				$('html,body').scrollTop(scrollPos); // without the page jumping
			}
			return false; // Disable any default click events.
		}


		function storeHeight(el) {
			var $el = $(el);
			$el.css('height', 'auto');
			$(el).data('originalHeight', $el.height()); // find each content block and store its height
			// close the content element if it was previously closed
			if ($el.parent().hasClass('open') === false) {
				$el.css('height', '0');
			}
		}

		function onUrlHashChange(event) { // Control the accordion with the back and forward buttons
			var url = document.URL,
				urlArr = url.split('#'),
				lastEl = urlArr.length - 1,
				urlHash = '#' + urlArr[lastEl];
	
			hideContent();
			if (urlHash !== '#') {
				showContent($(urlHash));
			} else {
				scrollToAnchor();
			}
		}

		function showContent(el) {
			var h;

			if (el.data('originalHeight') === undefined) {
				h = el[0].clientHeight; // Grab the value 'originalHeight' stored on this element
			} else {
				h = el.data('originalHeight'); // Grab the value 'originalHeight' stored on this element
			}

			el.animate({
				height: h
			}, {duration: options.duration, easing: options.easing}); // Define duration and easing

			if (typeof(el) === 'object') {
				el[0].parentElement.className = 'accordion-item open';
			}
		}

		function hideContent() {
			$base.find('.open')
            .removeClass('open') // Hide current item with class of 'open'
			.children(options.content)
			.animate({
				height : 0
            }, { queue: true, duration: options.duration, easing: options.easing, complete: resetContent }); // Define queuing, duration, easing and apply resetContent function once complete
		}

		function resetContent() {
			if (urlHash !== '#') {
				$(this).not(urlHash).css({ // Reset all content except the one that relates to the hash
					'height' : 0,
					'overflow' : 'hidden',
					// 'border-bottom' : 'none',
					'display' : 'block'
				}); // Reset CSS for the content area
			} else {
				$(this).css({
					'height' : 0,
					'overflow' : 'hidden',
					// 'border-bottom' : 'none',
					'display' : 'block'
				}); // Reset CSS for the content area
			}
		}

		function scrollToAnchor() {
			if (urlHash.length > 1) { // if the hash has a value... As it could be just a #
				elPos = $(urlHash).offset(),
				scrollPos = elPos.top; // Get the offsetTop position of the current 'open' item
				$(window).load(function () {
					setTimeout(function () { // wait for the page to do it's funny business
						$('html,body').scrollTop(scrollPos); // Set the position
					}, 200);
				});
			} else {
				$('html,body').scrollTop(scrollPos); // Keep the scroll position the same if the hash is #, otherwise it will go to top of page
			}
		}

		function assignHrefAndIDVal($el) { // Assign each toggle with a Href and the content with a matching ID
			// if the first href isn't defined, define them all and the ID's of the content, based on the heading
			if (!$el.find('.toggle').attr('href') && options.browserNavigation === true) {
				var itemArr = $el.children(),
					total = itemArr.length,
					i = 1,
					val,
					ID,
					href;

				$.each(itemArr, function () {
					val = encodeURIComponent($(this).find('a.toggle *:not(:has("*"))').text().split(' ').join('-')),
					href = '#' + val,
					ID = val;

					$(this).find(options.header).attr('href', href);
					$(this).find(options.content).attr('id', ID);
					i += 1;
				});
			}
		}

		function haveEasing() { // Warn the user if they have defined an easing property but not added the easing plugin
			if ((jQuery.easing['jswing']) === undefined && options.easing !== 'linear') {
				console.log('*** You defined an easing property but have not added the jQuery easing plugin. *** \n *** Download it here: http://gsgd.co.uk/sandbox/jquery/easing/ ***');
			}
		}

	};
})(jQuery);