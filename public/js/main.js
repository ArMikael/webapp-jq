 // Fixing issue with IE8 console.log support and error message
// if (!window.console) {
// 	console = {log: function() {}};
// }

(function ($) {
	'use strict';

	$.ready = function() {

		/** AJAX  Section **/
		var $notification = $('.notifications');

		$.ajax({
			url: '../data/notification.txt'
		})
		.done(function(response){
			$notification.html('<p>' + response + '</p>');
		})
		.fail(function(error){
			$notification.html('<p>' + error + '</p>');
		});


	 	/** GLOBAL VARIABLES **/
		// Array for saving sites as JS Object
		var sitesCollector = [],
			$activeTab,
			savedReports;


		// Creating "Select" options
		var createOptions = function (sitesCollector) {

			for (var i = 0; i < sitesCollector.length; i++) {
				if (typeof(sitesCollector[i]) === 'object') {
					var $parentForm = $('#' + sitesCollector[i].formID),
						$select = $parentForm.parent().find('select'),
						$prevSelect = $select.find('option[selected="selected"]'),
						$iframe = $parentForm.parent().find('iframe');

					// Remove previosly selected item if exist
					if ($prevSelect !== null) {
						$prevSelect.removeAttr('selected');
					}

					$('<option>' + sitesCollector[i].siteName + '</option>')
						.attr({
							selected: 'select',
							value: sitesCollector[i].url
						})
						.appendTo($select);

					// Sending last site url to iframe for loading the web-site
					if (typeof (sitesCollector[i + 1]) !== 'object') {
						$iframe.attr('src', sitesCollector[i].url);
					}
				}
			}
		};


		/**
		 * Tabs Section
		 */
		var switchTab = function(e) {

			var target = e.currentTarget;
			$activeTab = $('.active-tab');
			$activeTab.removeClass('active-tab');
			$(target).addClass('active-tab');


			// Saving the active tab to localStorage
			if (Modernizr.localstorage) {
				savedReports = localStorage.getItem('savedReports');

				// Checks if localStorage has "savedReports"
				if (savedReports !== null) {
					var parsedData = JSON.parse(savedReports),
						lastCell = parsedData[parsedData.length - 1],
						lastIndex = parsedData.length - 1;

					if (typeof(lastCell) === 'string') {
						// Removing old active tab
						parsedData.splice(lastIndex, 1, target.id);
					}

					localStorage.savedReports = JSON.stringify(parsedData);

				} else {
					var newArray = [target.id];
					localStorage.savedReports = JSON.stringify(newArray);
				}
			}
		};


		/* Function open categories submenus on focus and highlighting currently
		 selected list items */
		var showMenu = function(e) {
			var target = e.target,
				$activeItem = $('.active-item'),
				$parent = $(target).parent();

			if ($activeItem !== null) {
				$activeItem.removeClass('active-item');
			}

			$(target).addClass('active-item');

			if (!$parent.parent().hasClass('active-menu')) {
				$parent.parent().addClass('active-menu');
			}
		};

		/* Function closes categories */
		var closeMenu = function(e) {
			var target = e.target,
				$parent = $(target).parent(),
				$submenus = $('.menu-items');

			$submenus.each(function() {
				 $(this).removeClass('active-menu');
			});

			if (e.type === 'focus') {
				$parent.parent().addClass('active-menu');
			}
		};


		/**
		 * Reports section
		 */

		// Check if the Reports window in current tab is displayed and show it if needed
		var openReports = function(e) {
			var $reports;

			// Checks if the Event trigger is not on "Open Reports" button
			if (!$(e.currentTarget).hasClass('app-button')) {
				$reports = $(e.currentTarget).parent();
				$reports.toggleClass('active-window');

				// If the clicked button is "Save" run loadFrame function,
				// otherwise do nothing (for ignoring "Cancel" button).
				if ($(e.currentTarget).hasClass('submit_btn')) {
					loadFrame(e);
				}

			// If not, the trigger was "Reports" button
			} else {
				$reports = $(e.currentTarget).parent().find('.reports');
				$reports.toggleClass('active-window');
			}
		};

		var loadFrame = function (e) {
			var $parent = $(e.currentTarget).parent(),
				$tabContent = $parent.parent(),
				// Finding iframe element in the current tab content
				$iframe = $tabContent.find('iframe'),
				$selectedOpt;

			// Change iframe when user choose another option from the sites dropdown list
			$selectedOpt = $tabContent.find(':selected');
			$iframe.attr('src', $selectedOpt[0].value);
		};

		// Function that checks what event triggered and if on keypress "Enter" was clicked
		var checkEvent = function(e) {
			e.preventDefault();

			if ( e.type === 'click' ) {
				openReports(e);
			} else if ( e.type === 'keypress' &&  e.keyCode === 13 ) {
				openReports(e);
			}
		};

		// Function for open in new tab button
		var openNewTab = function(e) {
			var $iframe = $(e.currentTarget).parent().find('iframe'),
			$src = $iframe.attr('src'),
			newWindow;

			newWindow = window.open($src, '_blank');
			newWindow.focus();
		};

		var checkNewTabEvent = function (e) {
			if ( e.type === 'click' ) {
				openNewTab(e);
			} else if ( e.type === 'keypress' &&  e.keyCode === 13 ) {
				openNewTab(e);
			}
		};


		var searchReport = function(e) {
			var target = e.target,
				//searchInput = target.childNodes[1].value,
				$searchInput = $(target).children().val(),
				$notification = $('.notifications'),
				$nameFields = $('.js-site-name'),
				sitesNames = [],
				// This rexExp ignores key-case and allows
				// to input report without last 1/2 letters
				regExRep = new RegExp('(' + $searchInput + '(([a-z]|\\d){1,2})?)', 'i'),
				match;

				console.log('SearchedInput: ' + $searchInput);

			e.preventDefault();


			$nameFields.each(function(index) {
		   		if($(this).val() !== '') {
					console.log('This val: ' + $(this).val());
					sitesNames.push($(this).val());
					console.log('index: ' + index);
					console.log('sitesNames: ' + sitesNames[0]);
				}
			});


			if (sitesNames.length === 0) {
				$notification.html('<p>' + 'The searched report "' + $searchInput +
				 '" is not found.' + '</p>');
			}

			for (var i = 0; i < sitesNames.length; i++) {
				match = sitesNames[i].match(regExRep);
				console.log('match: ' + match);

				if (match[0].toLowerCase() === sitesNames[i].toLowerCase()) {
					$notification.html('<p>' + 'Report "' + $searchInput +
					 '" is found.' + '</p>');

					// Finding the parent tab of input for activation
					var $content = $('#' + sitesCollector[i].formID).parent(),
						$tab = $content.parent(),
						$activeTab = $('.active-tab'),
						$iframe = $content.find('iframe'),
						$preSelect,
						$newSelect;

					// Changing active tab
					$activeTab.removeClass('active-tab');
					$tab.addClass('active-tab');

					// Removing selection from previous item in the list
					$preSelect = $content.find(':selected');
					$preSelect.removeAttr('selected');

					// Adding "selected" attribute to the searched report
					$newSelect = $content.find('option[value="' +
						sitesCollector[i].url + '"]');
					$newSelect.attr('selected', 'selected');

					// Changing iframe src to the searched one
					$iframe.attr('src', $newSelect.val());

				} else {
					$notification.html('<p>' + 'The searched report "' +
					 $searchInput + '" is not found.' + '</p>');
				}
			}
		};


		/**
		 * Validating fields and saving new sites in reports window
		 */

		// Checks if some of the inputs is not empty
		var checkFields = function (parentForm, e) {

			var $fields = $(parentForm).find('.report-row'),
				$firstInputName = $fields.eq(0).find('.js-site-name'),
				$firstInputURL = $fields.eq(0).find('.js-site-url'),
				$message = $(parentForm).find('.system-message'),
				$wrongInputs = $('.wrong'),
				localSaver = localStorage.savedReports,
				i,
				$field,
				$siteTitle,
				$siteURL,
				validationAnswer;

			// Removing all elements from "sitesCollector" array
			sitesCollector = [];

			// Removing red border from all inputs before running again over them
			$wrongInputs.each(function(){
				$(this).removeClass('wrong');
			});

			// Removing previous system message
			$message.html('');

			// Checks if at least the first fieldset inputs is not empty
			if ($firstInputName.val() === '' && $firstInputURL.val() === '' &&
				// Checks if there is any saved reports in localStorage
				!localSaver || localSaver.length <= 8) {
				$message.html('Please, write site name and URL before saving.');

				$firstInputName.focus();
			} else if ($firstInputName.val() === '' && $firstInputURL.val() === '' &&
				localSaver.length > 8 ) {

				// Closing the "Report" window
				$(parentForm).toggleClass('active-window');

				// Removes all sites from 'Select' options list
				$(parentForm).prev().empty();

				// Cleaning localStorage
				localStorage.removeItem(savedReports);

				// Removing iframe
				$(parentForm).next().find('iframe').removeAttr('src');
			}

			// Checks every field in current tab "Report" form
			for (i = 0; i < $fields.length; i++) {
				$field = $fields.eq(i);

				// Variables to check every input value in the Report window
				$siteTitle = $field.find('.js-site-name');
				$siteURL = $field.find('.js-site-url');


				//	Checks all inputs in Reports window and return some message or func
				if ($siteTitle.val() !== '' || $siteURL.val() !== '') {

					// Adding "http" protocol to the entered url value without it
					if ($siteURL.val().substring(0, 4) !== 'http') {
						$siteURL.val('http://' + $siteURL.val());
					}

					if ($siteTitle.val() !== '' && $siteURL.val() === '') {
						$message.html('Please, enter the site URL!');
						$siteURL.addClass('wrong');
						$siteURL.focus();
					} else if ($siteTitle.value === '' && $siteURL.value !== '') {
						$message.html('Please, write the title for entered URL!');
						$siteTitle.addClass('wrong');
						$siteTitle.focus();
					} else if ($siteTitle.val() !== '' && $siteURL.val() !== '') {
						// Sends url for validation
						validationAnswer = validateField($siteURL.val());

						// If it's valid add it to list of sites
						if (validationAnswer) {
							saveNewSite($siteTitle.val(), $siteURL.val(), e, parentForm, $field[0]);
						} else {
							$message.html('Please, enter valid URL!');
							$siteURL.addClass('wrong');
							$siteURL.focus();
						}
					}
				}
			}
		};

		// Validating fields
		var validateField = function (url) {
			var regEx = /http(s)?:\/\/w{0,3}.+\.\w{2,4}(.+)?/g;
			return regEx.test(url);
		};

		// Preventing default activity of form submition and running checkFields function
		var checkNewSite = function (e) {
			var parentForm = e.target.parentNode;

			e.preventDefault();

			checkFields(parentForm, e);
		};


		// Adding new site to the select element
		var saveNewSite = function (title, url, e, parentForm, field) {
			var $sitesList = $(parentForm).parent().find('select'),
				$selectedOpt = $sitesList.find(':selected'),
				$contentDiv = $(parentForm).parent(),
				$activeTab = $contentDiv.parent().attr('id'),
				fieldID = field.id,
				site = {};

			// Removing all previously saved sites in the "Select" element
			$sitesList.empty();

			// Creating "site" object and pushing it to "sitesCollector" array
			site = {
				siteName: title,
				url: url,
				fieldID: fieldID,
				formID: parentForm.id
			};

			// Creating options in Select for each element in "sitesCollector" array
			createOptions(sitesCollector);

			// Adding the last element separate to give him "selected" attribute
			sitesCollector.push(site);

			// Adding active-tab at the end of array
			sitesCollector.push($activeTab);

			// Checking if browser allows to use localStorage and if yes adding
			// new reports to the localStorage
			if (Modernizr.localstorage) {
				// Sets the key "savedReports" and siteCollector array as a value
				localStorage.savedReports = JSON.stringify(sitesCollector);
			}

			// Removing selection from previous item in the list
			if ($selectedOpt) {
				$selectedOpt.removeAttr('selected');
			}

			// Creating new item in the "Select" elm and adding "selected" attr to it
			$('<option/>', {
				value: url,
				selected: 'selected',
				text: title
			}).appendTo($sitesList);

			// Call for checkEvent and then for toggle function that checks
			// if the Reports window was opened and close it.
			checkEvent(e);
		};


		// Closing Reports window on pressing "Escape"
		var escapeReports = function (e) {
			var target = e.target,
				$reportsDiv = $(target).parent().parent();

			if (e.keyCode === 27) {
				$reportsDiv.removeClass('active-window');
			}
		};



		// Init function starts all event listeners on the page and restoring previously
		// saved data from local storage
		var init = function(e) {
			var i;

			// Checking saved key in localStorage
			savedReports = localStorage.getItem('savedReports');
			console.log('Init');
			console.log(savedReports);


			/** IE8 PLACEHOLDERS **/
			// Adding placeholders to Report's inputs for IE8 with Modernizer
			console.log('Modernizr.input.placeholder: ' + Modernizr.input.placeholder);

			// Arrays for IE8 placeholders
			var $nameArr = $('.js-site-name'),
				$urlArr = $('.js-site-url'),
				$searchForm = $('#search'),
				$search = $('#search > input');

			// Event listener for "Submit" click for search button
			$searchForm.on('submit', searchReport);


			if (!Modernizr.input.placeholder) {

				var checkInput = function (e) {
					var target = e.target;

					// Checks if the current value is placeholder and only then removes it
					if (target.value === 'Site name' || target.value === 'Site URL' ||
						target.value === 'Search') {
						target.value = '';
					}
				};

				// Adding placeholder and event listener to the Search field in IE8
				$search.val('Search');
				$search.on('focus', checkInput);

				// Adding IE placeholders and event listeners to reports inputs
				$nameArr.each(function(i) {
					$nameArr.eq(i).val('Site name');
					$urlArr.eq(i).val('Site URL');

					$nameArr.eq(i).on('focus', checkInput);
					$urlArr.eq(i).on('focus', checkInput);
				});
			 }


			// Checks if localStorage is supported and allowed by the browser
			if (Modernizr.localstorage) {
				savedReports = localStorage.getItem('savedReports');

				// Checks if localStorage has "savedReports"
				if (savedReports) {
					var parsedData = JSON.parse(savedReports),
						fieldsetID,
						$fieldset,
						$nameInput,
						$urlInput;

					/** Restoring Reports fields from Local Storage **/
					for (i = 0; i < parsedData.length; i++) {

						// Checks if current cell is "site" object
						if (parsedData[i].fieldID) {
							fieldsetID = parsedData[i].fieldID;

							$fieldset = $('#' + fieldsetID);
							$nameInput = $fieldset.find('.js-site-name');
							$urlInput = $fieldset.find('.js-site-url');

							// Adding site name and url to apropriate input fields
							$urlInput.val(parsedData[i].url);
							$nameInput.val(parsedData[i].siteName);
						}
					}

					/** Restoring active tab from Local Storage **/
					if (typeof(parsedData[parsedData.length - 1]) === 'string') {
						var $restoredTab;

						$activeTab = $('.active-tab');
						$activeTab.removeClass('active-tab');

						$restoredTab = $('#' + parsedData[parsedData.length - 1]);
						$restoredTab.addClass('active-tab');
					}

					// Creation options in "Select" dropdown
					var	sitesCollector = [];

					$(parsedData).each(function(i) {
						if (typeof parsedData[i] === 'object') {
							sitesCollector.push(parsedData[i]);
						}
					});

					// Adding options to SELECT elements from saved data
					createOptions(sitesCollector);
				}
			}


			/** NAVIGATION EVENT LISTENER **/

			// Event listeners for shifting between menu items
			var $menuItems = $('.menu-items a');

			$menuItems.each(function(i) {
				$menuItems.eq(i).on('focus', showMenu);
			});

			// Event listeneres for closing previous submenus
			// on focusing of first list items in every category
			var $firstItem = $('.menu-items li:first-child a');

			$firstItem.each(function(i) {
				$firstItem.eq(i).on('focus', closeMenu);
			});

			// Event listeners for closing last category submenu after leaving the last item
			var $lastItem = $('.last-menu-item');

			$lastItem.on('blur', closeMenu);


			/** TABS AND REPORTS EVENT LISTENER **/

			// Event Listeners for switching tab function
			var $tabs = $('.tab');

			$tabs.each(function(i) {
				$tabs.eq(i).on('click focus', switchTab);
			});

			// Event lisnteres that calls to function to open report in new tab
			var $newTabBtn = $('.new-tab-btn');

			$newTabBtn.each(function(i) {
				$newTabBtn.eq(i).on('click keypress', checkNewTabEvent);
			});

			// Event listeners for "Reports" app button for opening "Reports" section
			var $reportsBtn = $('.reports-btn');

			$reportsBtn.each(function(i) {
				$reportsBtn.eq(i).on('click keypress', checkEvent);
			});

			// Event listeneres for "Cancel" button that closing Reports window
			var $cancelBtn = $('.cancel-btn');

			$cancelBtn.each(function(i) {
				$cancelBtn.eq(i).on('click keypress', checkEvent);
			});

			// Listeners that chekcs "Submit" button click
			var $saveBtns = $('.submit_btn');

			$saveBtns.each(function(i) {
				$saveBtns.eq(i).on('click keypress', checkNewSite);
			});

			// Listener that checks if anothor site was choosed by user in dropdown list.
			var $selects = $('select');

			$selects.each(function(i) {
				$selects.eq(i).on('change', loadFrame);
			});

			// Event listeners for escaping "Reports" on "Esc" button
			var $inputs = $('.reports input');

			$inputs.each(function(i) {
				$inputs.eq(i).on('keyup', escapeReports);
			});
		};

		init();
	};
}(jQuery));
;/**
 * Utils library v4
 */

var UTILS = (function () {

	return {
		/**
		 * Shorthand for `querySelector`
		 *
		 * @param  {string} selector CSS like selector
		 * @return {Object}          DOM Node
		 */
		qs: function (selector) {
			return document.querySelector(selector);
		},

		/**
		 * Shorthand for `querySelectorAll`
		 *
		 * @param  {string} selector CSS like selector
		 * @return {Object}          DOM NodeList
		 */
		qsa: function (selector) {
			return document.querySelectorAll(selector);
		},


		/**
		 * Creating handlers hasClass, addClass, removeClass and toggle
		 */
		hasClass: function (elm, chkClass) {
			// elm.classList.contains(chkClass);
			var className = elm.className,
				classArr = className.split(' ');

			for (var i = 0; i < classArr.length; i++ ) {
				if ( classArr[i] === chkClass ) {
					return true;
				}
			}
			return false;
		},

		addClass: function (elm, newClass) {
			// Check current elm class
			var curClass = elm.className;
			curClass !== '' ? elm.className = curClass + ' ' + newClass : elm.className = newClass;
		},

		removeClass: function (elm, rmvClass) {
			// elm.classList.remove(rmvClass);
			var className = elm.className,
				classArr = className.split(' ');

				for (var i = 0; i < classArr.length; i++) {
					if (classArr[i] === rmvClass) {
						classArr.splice(i, 1);
						elm.className = classArr.join(' ');
					}
				}
		},

		toggle: function (elm, className) {
			// elm.classList.toggle(className);
			var index = elm.className.indexOf(className);

			if (index === -1) {
				elm.className = elm.className + ' ' + className;
			} else {
				var regEx = new RegExp('(\\s)?' + className + '(\\s)?');
				elm.className = elm.className.replace(regEx,'');
			}
		},

		/**
		 * Cross browser event handler
		 *
		 * @param {Object}   elm     Element on which the event will be bound
		 * @param {string}   type    Event type or types (e.g. 'click', 'click input')
		 * @param {Function} handler Callback function to run when event is fired
		 */
		addEvent: function (elm, type, handler) {
			var types = type.split(' '),
				ieHandler;

			// Recurse if multiple event types were given
			if (types.length > 1) {
				// On each iteration, remove the first value in the array
				while (types.length) {
					UTILS.addEvent(elm, types.shift(), handler);
				}

				return;
			}

			// Modern browsers and IE9+
			if (window.addEventListener) {
				elm.addEventListener(type, handler, false);
			// IE8
			} else if (window.attachEvent) {
				// Required for normalizing the "event" object,
				// to have the same API as addEventListener
				ieHandler = function (e) {
					e.target = e.target || e.srcElement;
					e.currentTarget = e.currentTarget || elm;

					e.stopPropagation = e.stopPropagation || function () {
						e.cancelBubble = true;
					};

					e.preventDefault = e.preventDefault || function () {
						e.returnValue = false;
					};

					return handler.call(elm, e);
				};

				// Save a reference to the handler function with a unique key
				elm[type + handler] = ieHandler;

				// Support triggering custom events
				// Save event handlers in a special property on elm
				elm._events = elm._events || {};
				// Init event handlers array for the specific type, if doesn't exist
				if (!elm._events[type]) {
					elm._events[type] = [handler];
				// Add another handler, unless it already exists
				} else if (elm._events[type].toString().indexOf(handler) < 0) {
					elm._events[type].push(handler);
				}

				// Bind the event, the IE way
				elm.attachEvent('on' + type, ieHandler);
			}
		},

		/**
		 * Check if Event constructors are supported
		 *
		 * @return {Boolean}
		 */
		isModernEvent: function () {
			try {
				if (new Event('submit', {bubbles: false}).bubbles !== false) {
					return false;
				} else if (new Event('submit', {bubbles: true}).bubbles !== true) {
					return false;
				} else {
					return true;
				}
			} catch (e) {
				return false;
			}
		},

		/**
		 * Trigger an event on a specific element
		 *
		 * Note:
		 * - bubbles/cancelable - `false` by default (not supported in IE8)
		 *
		 * @param  {Object} elm      DOM Node
		 * @param  {string} type     Event type (e.g. 'click', 'customEvent')
		 * @param  {Object} options  Options object (e.g. bubbles, cancelable)
		 */
		emitEvent: function (elm, type, options) {
			var evt,
				bubbles,
				cancelable,
				// Will be used as a fallback event object for IE8
				eFallback;

			// Support Event options
			options = options || {};
			bubbles = options.bubbles !== undefined ? options.bubbles : false;
			cancelable = options.cancelable !== undefined ? options.cancelable : false;

			// Create an event object
			// Modern browsers (except IE Any)
			if (UTILS.isModernEvent()) {
				evt = new Event(type, {
					bubbles: bubbles,
					cancelable: cancelable
				});
			// IE 9+
			} else if (document.createEvent) {
				evt = document.createEvent('Event');
				evt.initEvent(type, bubbles, cancelable);
			// IE 8
			} else {
				evt = document.createEventObject();
			}

			// Trigger the event
			// Modern browsers and IE9+
			if (elm.dispatchEvent) {
				elm.dispatchEvent(evt);
			// IE8
			} else if (elm.fireEvent) {
				// `fireEvent` will fail on non real events (i.e. custom events)
				try {
					elm.fireEvent('on' + type, evt);
				} catch (e) {
					// If we have any event handlers saved during `addEvent`
					if (elm._events && elm._events[type]) {
						// Support minimal Event properties
						eFallback = {
							target: elm,
							currentTarget: elm
						};

						// Trigger all event handlers for this event type
						for (var i = 0; i < elm._events[type].length; i++) {
							elm._events[type][i].call(elm, eFallback);
						}
					}
				}
			}
		},

		/**
		 * Cross browser event removal
		 *
		 * @param {Object}   elm     Element on which the event should be unbound
		 * @param {string}   type    Event type to unbind
		 * @param {Function} handler Reference to the original callback function
		 */
		removeEvent: function (elm, type, handler) {
			var handlerRef;

			if (window.removeEventListener) {
				// Modern browsers
				elm.removeEventListener(type, handler, false);
			} else if (window.detachEvent) {
				// IE8 and below
				handlerRef = elm[type + handler];

				// Make sure the handler key exists
				if (handlerRef) {
					elm.detachEvent('on' + type, handlerRef);
					// Remove the key from the object, prevent memory leaks
					delete elm[type + handler];
				}
			}
		},

		/**
		 * Check if a given value is a plain Object
		 *
		 * @param  {*}       o Any value to be checked
		 * @return {Boolean}   true if it's an Object
		 */
		isObject: function (o) {
			var toString = Object.prototype.toString;
			return (toString.call(o) === toString.call({}));
		},

		/**
		 * AJAX helper function (similar to jQuery, but far from it!)
		 *
		 * @param {string} url     URL for the ajax request
		 * @param {Object} options AJAX settings
		 */
		ajax: function (url, options) {
			var xhr = new XMLHttpRequest(),
				method = 'GET',
				options = UTILS.isObject(options) ? options : {};

			// Check if "method" was supplied
			if (options.method) {
				method = options.method;
			}

			// Setup the request
			xhr.open(method.toUpperCase(), url);

			xhr.onreadystatechange = function () {
				var status;

				// If request finished
				if (xhr.readyState === 4) {
					status = xhr.status;

					// If response is OK or fetched from cache
					if ((status >= 200 && status < 300) || status === 304) {
						var res = xhr.responseText,
							contentType = xhr.getResponseHeader('Content-Type');

						// If server sent a content type header, handle formats
						if (contentType) {
							// Handle JSON format
							if (contentType === 'text/json' ||
								contentType === 'application/json') {

								// JSON throws an exception on invalid JSON
								try {
									res = JSON.parse(res);
								} catch (err) {
									// Trigger "fail" callback if set
									if (options.fail) {
										options.fail.call(xhr, err);
										return;
									}
								}
							// Handle XML format
							} else if (contentType === 'text/xml' ||
								contentType === 'application/xml') {
								// responseXML returns a document object
								res = xhr.responseXML;

								// if XML was invalid, trigger fail callback
								if (res === null && options.fail) {
									options.fail.call(xhr, 'Bad XML file');
									return;
								}
							}
						}

						// Trigger done callback with the proper response
						if (options.done) {
							options.done.call(xhr, res);
						}
					}

				}
			};

			// Fire the request
			xhr.send(null);
		}
	};
}());

//# sourceMappingURL=main.js.map