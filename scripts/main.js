var APP = APP || {};

APP.common = APP.common || (function () {

	function init() {
		/* code goes here */
	}

	return {
		init: init
	};
}());


// Mobile navigation - This will only work for 2 navigation tiers
APP.mobileNavigation =  (function () {

	var $menuToggle = $('#mobile-navigation-toggle'),
		$menu = $('.navigation.primary > ul'),
		$menuItem = $('.navigation.primary > ul li a'),
		winWidth = $(window).width(),
		breakPoint = 568, // Update this if the mobile breakpoint ever changes
		defaults = {
			speed: 250,
			openMenu: false,
			nth: 1,
			headerLinks: false // If false and if top level item has children, this will be disabled on first click, allowing its children to display. Second click will navigate.
		},
		options = {};

	function init(initObj) {

		options = $.extend(defaults, initObj);

		// show / hide top level mobile nav
		$menuToggle.on('click', function (e) {
			e.preventDefault();
			if ($(this).hasClass('expanded')) {
				$menu.slideUp(options.speed);
				$(this).removeClass('expanded');
			} else {
				$menu.slideDown(options.speed);
				$(this).addClass('expanded');
			}
		});

		// Show / hide second level
		if (winWidth < breakPoint) {
			if (options.headerLinks === false) {
				$menuItem.click(function (e) {
					$('li a.expanded').not(this).removeClass('link-active expanded').next('ul').slideUp(options.speed); // Slide up other open child UL's
					if ($(this).next('ul').children('li').length > 0 && !$(this).hasClass('link-active')) { // if children and not active
						e.preventDefault(); // disable navigation
						$(this).addClass('link-active expanded').next('ul').slideDown(options.speed); // Show children
					}
				});
			}
		}

	}

	return {
		init: init
	};

} ());

APP.contentTabs = APP.contentTabs || (function () {
	'use strict';



	function init() {
		// Tabs - content page
		$('.tab-navigation li a').click(function(e){

			var clicked = $(this).attr('data-tab'),
				fullUrl;

			// no tab defined? go directly to the page instead.
			if (!clicked) {
				return true;
			}

			$('.tab-box .tab-content').hide();
			$('.tab-box #' + clicked).fadeIn();
			$('.tab-navigation li a').not(this).removeClass('active');
			$('.tab-navigation li a').css('padding-left', '16px');
			
			if (window.history.pushState) {
				fullUrl = $(this).attr('href');
				window.history.replaceState(clicked, clicked, fullUrl);
			}

			$(this).addClass('active');

			if ($('.tab-head:visible').isOnScreen() === false) {
				$('html,body').animate({
					scrollTop: $('.tab-head:visible').offset().top + 20
				}, 250);
			}

			return false;
		});

		// Open content tab depends on url
		if (location.href.split('#').length > 1) {
			var activeTab = location.href.split('#')[1];
			$('.tab-box .tab-content').hide();
			$('.tab-box #' + activeTab).fadeIn();
			$('.tab-navigation a').removeClass();
			$(".tab-navigation a[href='#" + activeTab + "']").addClass('active');
		}
		//Remove padding from navigation when #jobs is visible
		if ($('.tab-box .landing-content').is(':visible')) {
			$('.tab-box .tab-navigation ul li a').css('padding-left','0');
		}

		//Tab navigation for profiles list
		$('.profile-nav a').click(function(){
			$('.profile-item').hide();
			$('#profile-' + $(this).text()).show();
			$(this).addClass('active');
			$('.profile-nav a').not(this).removeClass('active');

			if (window.history.pushState) {
				var url = $(this).attr('href');
				window.history.replaceState(url, url, url);
			}
			return false;
		});
	}

	return {
		init: init
	};


}());


APP.tabbedPage = APP.tabbedPage || (function () {
	'use strict';

	var $navItems,
		$currentLink,
		$contentContainer,
		contentId,
		url;

	function init() {
		$navItems = $('.tabbed-page-navigation li');
		$contentContainer = $('#content');
		setupTabEvents();
	}

	function setupTabEvents() {
		$('.tabbed-page-navigation a').on('click', getData);
	}


	function getData(evt) {
		//Get current page AJAX content from service
		$currentLink = $(this);
		contentId = $currentLink.attr('data-page-id');
		url = '/umbraco/surface/subpagecontent/render/' + contentId;

		$.get(url, tabContentLoaded);

		return false;
	}

	function tabContentLoaded(data) {
		$contentContainer.html(data);
		updateLocationUrl();
		updateTabStatus();
		scrollToContent();
	};

	function updateLocationUrl(evt) {
		var fullUrl;
		//Change url in location bar
		if (window.history.pushState) {
			fullUrl = $currentLink.attr('href');
			window.history.replaceState(contentId, contentId, fullUrl);
		}
	}

	function updateTabStatus() {
		//Mark active item
		$navItems.removeClass('active');
		$currentLink.parent().addClass('active');
	}

	function scrollToContent() {
		setTimeout(function () {
			$('html,body').animate({
				scrollTop: $('#main').offset().top
			});
		}, 250);
	}


	return {
		init: init
	};
}());


$(document).ready(function () {
	APP.common.init();
	APP.mobileNavigation.init();
});