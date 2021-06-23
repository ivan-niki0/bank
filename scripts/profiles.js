var APP = APP || {};

APP.profilesFilter = APP.profilesFilter || (function () {
	'use strict';

	var $filterListItems,
		$filterLinks,
		$groups,
		$filterDisplayText,
		profileType,
		profileName;

	function init() {
		$filterListItems = $('#navigation-secondary li');
		$filterLinks = $('#navigation-secondary a');
		$groups = $('.m-profile-list .group');
		$filterDisplayText = $('#filter-type');
		clickFilter();
	}

	function clickFilter() {
		$filterLinks.on('click', function (e) {
			var $this = $(this);
			e.preventDefault();
			profileType = $this.attr('data-type');
			profileName = $this.attr('data-name');
			$filterListItems.removeClass('active');
			$this.parents('li').addClass('active');
			APP.profiles.closeText();
			displayGroups(profileType, profileName);
		});
	}

	function displayGroups(type, name) {
		if (type === 'All') {
			$groups.addClass('reveal').removeClass('hide');
			$filterDisplayText.html('All');
		} else {
			$groups.addClass('hide').removeClass('reveal');
			$groups.filter('[data-type=' + type + ']').addClass('reveal').removeClass('hide');
			$filterDisplayText.html(name);
		}
	}

	return {
		init: init
	};

}());


APP.profiles = APP.profiles || (function () {
	'use strict';

	var $container,
		winWidth,
		breakPoint,
		$currentItem,
		$profileItems,
		$profileItemDetail,
		$ajaxContainer,
		currentText,
		currentOffset,
		openedClass,
		closeButtonClass;

	function init() {
		$container = $('.m-profile-list');
		winWidth = $(window).width();
		breakPoint = 568;

		if (winWidth < breakPoint) {
			var $accordion = $container;
			if ($accordion.length > 0) {
				$accordion.vAccordion({
					duration: 150,
					header: 'h2.toggle',
					content: '.content',
					browserNavigation: false,
					videoSupport: false,
					videoAutoPlay: false
				});
				$('.doctype-ourpeoplepage').find('.m-profile-list .toggle').filter(':first').click();
			}
		} else {
			$currentItem = null;
			openedClass = 'open';
			$profileItems = $('.profile-item');
			$profileItemDetail = $('#profile-item-detail');
			$ajaxContainer = $('#profile-item-detail > .decor');
			closeButtonClass = '.close';
			setupProfileEvents();
		}
	}

	function setupProfileEvents() {
		// Events
		$profileItems.on('click', clickThumb)
			.find('a').on('click', function (e) {
				e.preventDefault();
			});
	}

	function clickThumb(evt) {
		var profileid,
			$this = $(this);

		$currentItem = $this;
		profileid = evt.currentTarget.getAttribute('data-id');
		positionDetails($this);

		if ($this.hasClass('active')) {
			closeText();
			return;
		} else {
			getData(profileid);
		}
		$profileItems.removeClass('active').addClass('inactive');
		$this.addClass('active').removeClass('inactive');
		$profileItemDetail.attr('data-textid', profileid);

	}

	function getData(profileid) {
		var	requestUrl = '/umbraco/surface/subpagecontent/render/' + profileid;
		$.get(requestUrl, profileInfoLoaded);
		return false;
	}

	function profileInfoLoaded(data) {
		if (data.length !== 0) {
			$ajaxContainer.html(data);
			showText();
		} else {
			$ajaxContainer.html('No information available');
		}
		showText();
		setupPanelEvents();
	}

	function showText() {
		$profileItemDetail.slideDown()
			.addClass(openedClass);
	}

	function closeText() {
		$profileItemDetail.slideUp()
			.removeClass(openedClass);
		$currentItem = null;
		$profileItems.removeClass('active').removeClass('inactive');
		removePanelEvents();
	}

	function setupPanelEvents() {
		$profileItemDetail.find(closeButtonClass).on('click', function () {
			closeText($currentItem);
		});
	}

	function removePanelEvents() {
		$profileItemDetail.find(closeButtonClass).off('click');
	}

	function positionDetails(el) {
		var $rowItems;

		currentOffset = el.offset();
		currentText = $profileItemDetail.attr('data-textid');
		$profileItems.removeClass('current-row');

		$rowItems = $profileItems.filter(function () {
			return $(this).offset().top === currentOffset.top;
		});

		$rowItems.addClass('current-row');

		$profileItemDetail.removeClass(openedClass)
			.slideUp(400, function () {
				$profileItemDetail.detach().insertAfter($rowItems.last());
			});
	}

	return {
		init: init,
		closeText: closeText
	};
}());

$(document).ready(function () {
	'use strict';

	APP.profilesFilter.init();
	APP.profiles.init();
});