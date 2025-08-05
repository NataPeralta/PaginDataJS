/*
 * Released under the MIT license.
 */

(function (global) {

  var pluginName = 'pagination';
  var pluginHookMethod = 'addHook';
  var eventPrefix = '__pagination-';

  // Check if pagination is already defined
  if (global.PaginDataJS) {
    throwError('plugin conflicted, the name "PaginDataJS" has been taken by another plugin.');
  }

  // Helper functions
  var Helpers = {};

  function throwError(content) {
    throw new Error('Pagination: ' + content);
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function getObjectType(object) {
    var tmp = typeof (object);
    return (tmp == "object" ? object == null && "null" || Object.prototype.toString.call(object).slice(8, -1) : tmp).toLowerCase();
  }

  ['Object', 'Array', 'String'].forEach(function (name) {
    Helpers['is' + name] = function (object) {
      return getObjectType(object) === name.toLowerCase();
    };
  });

  // DOM helpers
  function $(selector) {
    if (typeof selector === 'string') {
      return document.querySelectorAll(selector);
    } else if (selector instanceof Element) {
      return [selector];
    } else if (selector instanceof NodeList) {
      return Array.from(selector);
    }
    return [];
  }

  function createElement(tag, className, innerHTML) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  function addEvent(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, handler);
    }
  }

  function removeEvent(element, event, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(event, handler);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, handler);
    }
  }

  function triggerEvent(element, eventName, data) {
    var event = new CustomEvent(eventName, { detail: data });
    element.dispatchEvent(event);
  }

  // Extend function
  function extend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function deepExtend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          deepExtend(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  // Main Pagination class
  function Pagination(container, options) {
    this.container = container;
    this.attributes = deepExtend({}, Pagination.defaults);
    extend(this.attributes, options);
    this.model = {
      pageRange: this.attributes.pageRange,
      pageSize: this.attributes.pageSize
    };
    this.disabled = !!this.attributes.disabled;
    this.isAsync = false;
    this.isDynamicTotalNumber = false;

    // Breakpoints system
    this.breakpoints = this.attributes.breakpoints || {};
    this.currentBreakpoint = null;
    this.resizeTimeout = null;

    this.initialize();

    // Initialize breakpoints if they exist
    if (Object.keys(this.breakpoints).length > 0) {
      this.initializeBreakpoints();
    }
  }

  Pagination.prototype = {

    initialize: function () {
      var self = this;

      // Cache data for current instance
      if (!self.container.paginationData) {
        self.container.paginationData = {};
      }

      if (self.callHook('beforeInit') === false) return;

      // Pagination has been initialized, destroy it
      if (self.container.paginationData.initialized) {
        var existingPagination = self.container.querySelector('.paginationjs');
        if (existingPagination) {
          existingPagination.remove();
        }
      }

      // Parse dataSource to find available paging data
      self.parseDataSource(self.attributes.dataSource, function (dataSource) {

        // Asynchronous mode
        self.isAsync = Helpers.isString(dataSource);
        if (Helpers.isArray(dataSource)) {
          self.model.totalNumber = self.attributes.totalNumber = dataSource.length;
        }

        // Asynchronous mode and a 'totalNumberLocator' has been specified
        self.isDynamicTotalNumber = self.isAsync && self.attributes.totalNumberLocator;

        var el = self.render(true);

        // Add extra className to the pagination element
        if (self.attributes.className) {
          el.classList.add(self.attributes.className);
        }

        self.model.el = el;

        // Append / prepend pagination element to the container
        if (self.attributes.position === 'bottom') {
          self.container.appendChild(el);
        } else {
          self.container.insertBefore(el, self.container.firstChild);
        }

        // Bind events
        self.observer();

        // Mark pagination has been initialized
        self.container.paginationData.initialized = true;

        // Call hook after initialization
        self.callHook('afterInit', el);
      });
    },

    render: function (isBoot) {
      var self = this;
      var model = self.model;
      var el = model.el || createElement('div', 'paginationjs');
      var isForced = isBoot !== true;

      self.callHook('beforeRender', isForced);

      var currentPage = model.pageNumber || self.attributes.pageNumber;
      var pageRange = self.attributes.pageRange || 0;
      var totalPage = self.getTotalPage();

      var rangeStart = currentPage - pageRange;
      var rangeEnd = currentPage + pageRange;

      if (rangeEnd > totalPage) {
        rangeEnd = totalPage;
        rangeStart = totalPage - pageRange * 2;
        rangeStart = rangeStart < 1 ? 1 : rangeStart;
      }

      if (rangeStart <= 1) {
        rangeStart = 1;
        rangeEnd = Math.min(pageRange * 2 + 1, totalPage);
      }

      el.innerHTML = self.generateHTML({
        currentPage: currentPage,
        pageRange: pageRange,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });

      // Whether to hide pagination when there is only one page
      if (self.attributes.hideOnlyOnePage) {
        el.style.display = totalPage <= 1 ? 'none' : 'block';
      }

      self.callHook('afterRender', isForced);

      return el;
    },

    getPageLinkTag: function (index) {
      var pageLink = this.attributes.pageLink;
      return pageLink ? `<a href="${pageLink}">${index}</a>` : `<a>${index}</a>`;
    },

    generatePageNumbersHTML: function (args) {
      var self = this;
      var currentPage = args.currentPage;
      var totalPage = self.getTotalPage();
      var rangeStart = args.rangeStart;
      var rangeEnd = args.rangeEnd;
      var html = '';
      var i;

      var ellipsisText = self.attributes.ellipsisText;
      var classPrefix = self.attributes.classPrefix;
      var pageClassName = self.attributes.pageClassName || '';
      var activeClassName = self.attributes.activeClassName || '';
      var disableClassName = self.attributes.disableClassName || '';

      // Display all page numbers if page range disabled
      if (self.attributes.pageRange === null) {
        for (i = 1; i <= totalPage; i++) {
          if (i == currentPage) {
            html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName} ${activeClassName}" data-num="${i}"><a>${i}</a></li>`;
          } else {
            html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName}" data-num="${i}">${self.getPageLinkTag(i)}</li>`;
          }
        }
        return html;
      }

      if (rangeStart <= 3) {
        for (i = 1; i < rangeStart; i++) {
          if (i == currentPage) {
            html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName} ${activeClassName}" data-num="${i}"><a>${i}</a></li>`;
          } else {
            html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName}" data-num="${i}">${self.getPageLinkTag(i)}</li>`;
          }
        }
      } else {
        if (!self.attributes.hideFirstOnEllipsisShow) {
          html += `<li class="${classPrefix}-page ${classPrefix}-first J-paginationjs-page ${pageClassName}" data-num="1">${self.getPageLinkTag(1)}</li>`;
        }
        html += `<li class="${classPrefix}-ellipsis ${disableClassName}"><a>${ellipsisText}</a></li>`;
      }

      for (i = rangeStart; i <= rangeEnd; i++) {
        if (i == currentPage) {
          html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName} ${activeClassName}" data-num="${i}"><a>${i}</a></li>`;
        } else {
          html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName}" data-num="${i}">${self.getPageLinkTag(i)}</li>`;
        }
      }

      if (rangeEnd >= totalPage - 2) {
        for (i = rangeEnd + 1; i <= totalPage; i++) {
          html += `<li class="${classPrefix}-page J-paginationjs-page ${pageClassName}" data-num="${i}">${self.getPageLinkTag(i)}</li>`;
        }
      } else {
        html += `<li class="${classPrefix}-ellipsis ${disableClassName}"><a>${ellipsisText}</a></li>`;

        if (!self.attributes.hideLastOnEllipsisShow) {
          html += `<li class="${classPrefix}-page ${classPrefix}-last J-paginationjs-page ${pageClassName}" data-num="${totalPage}">${self.getPageLinkTag(totalPage)}</li>`;
        }
      }

      return html;
    },

    generateHTML: function (args) {
      var self = this;
      var currentPage = args.currentPage;
      var totalPage = self.getTotalPage();
      var totalNumber = self.getTotalNumber();

      var pageSize = self.attributes.pageSize;
      var showPrevious = self.attributes.showPrevious;
      var showNext = self.attributes.showNext;
      var showPageNumbers = self.attributes.showPageNumbers;
      var showNavigator = self.attributes.showNavigator;
      var showSizeChanger = self.attributes.showSizeChanger;
      var sizeChangerOptions = self.attributes.sizeChangerOptions;
      var showGoInput = self.attributes.showGoInput;
      var showGoButton = self.attributes.showGoButton;

      var prevText = self.attributes.prevText;
      var nextText = self.attributes.nextText;
      var goButtonText = self.attributes.goButtonText;

      var classPrefix = self.attributes.classPrefix;
      var disableClassName = self.attributes.disableClassName || '';
      var ulClassName = self.attributes.ulClassName || '';
      var prevClassName = self.attributes.prevClassName || '';
      var nextClassName = self.attributes.nextClassName || '';

      var html = '';
      var sizeSelect = `<select class="J-paginationjs-size-select">`;
      var goInput = '<input type="text" class="J-paginationjs-go-pagenumber">';
      var goButton = `<input type="button" class="J-paginationjs-go-button" value="${goButtonText}">`;
      var formattedString;

      var formatSizeChanger = typeof self.attributes.formatSizeChanger === 'function' ? self.attributes.formatSizeChanger(currentPage, totalPage, totalNumber) : self.attributes.formatSizeChanger;
      var formatNavigator = typeof self.attributes.formatNavigator === 'function' ? self.attributes.formatNavigator(currentPage, totalPage, totalNumber) : self.attributes.formatNavigator;
      var formatGoInput = typeof self.attributes.formatGoInput === 'function' ? self.attributes.formatGoInput(goInput, currentPage, totalPage, totalNumber) : self.attributes.formatGoInput;
      var formatGoButton = typeof self.attributes.formatGoButton === 'function' ? self.attributes.formatGoButton(goButton, currentPage, totalPage, totalNumber) : self.attributes.formatGoButton;

      var autoHidePrevious = typeof self.attributes.autoHidePrevious === 'function' ? self.attributes.autoHidePrevious() : self.attributes.autoHidePrevious;
      var autoHideNext = typeof self.attributes.autoHideNext === 'function' ? self.attributes.autoHideNext() : self.attributes.autoHideNext;

      var header = typeof self.attributes.header === 'function' ? self.attributes.header(currentPage, totalPage, totalNumber) : self.attributes.header;
      var footer = typeof self.attributes.footer === 'function' ? self.attributes.footer(currentPage, totalPage, totalNumber) : self.attributes.footer;

      // Prepend extra contents to the pagination buttons
      if (header) {
        formattedString = self.replaceVariables(header, {
          currentPage: currentPage,
          totalPage: totalPage,
          totalNumber: totalNumber
        });
        html += formattedString;
      }

      // Whether to display navigator
      if (showNavigator) {
        if (formatNavigator) {
          formattedString = self.replaceVariables(formatNavigator, {
            currentPage: currentPage,
            totalPage: totalPage,
            totalNumber: totalNumber,
            rangeStart: (currentPage - 1) * pageSize + 1,
            rangeEnd: Math.min(currentPage * pageSize, totalNumber)
          });
          html += `<div class="${classPrefix}-nav J-paginationjs-nav">${formattedString}</div>`;
        }
      }

      if (showPrevious || showPageNumbers || showNext) {
        html += '<div class="paginationjs-pages">';

        if (ulClassName) {
          html += `<ul class="${ulClassName}">`;
        } else {
          html += '<ul>';
        }

        // Whether to display Previous button
        if (showPrevious) {
          if (currentPage <= 1) {
            if (!autoHidePrevious) {
              html += `<li class="${classPrefix}-prev ${disableClassName} ${prevClassName}"><a>${prevText}</a></li>`;
            }
          } else {
            html += `<li class="${classPrefix}-prev J-paginationjs-previous ${prevClassName}" data-num="${currentPage - 1}" title="Previous page">${self.getPageLinkTag(prevText)}</li>`;
          }
        }

        // Whether to display page numbers
        if (showPageNumbers) {
          html += self.generatePageNumbersHTML(args);
        }

        // Whether to display Next button
        if (showNext) {
          if (currentPage >= totalPage) {
            if (!autoHideNext) {
              html += `<li class="${classPrefix}-next ${disableClassName} ${nextClassName}"><a>${nextText}</a></li>`;
            }
          } else {
            html += `<li class="${classPrefix}-next J-paginationjs-next ${nextClassName}" data-num="${currentPage + 1}" title="Next page">${self.getPageLinkTag(nextText)}</li>`;
          }
        }
        html += `</ul></div>`;
      }

      if (showSizeChanger) {
        if (Helpers.isArray(sizeChangerOptions)) {
          if (sizeChangerOptions.indexOf(pageSize) === -1) {
            sizeChangerOptions.unshift(pageSize);
            sizeChangerOptions.sort((a, b) => a - b);
          }
          for (let i = 0; i < sizeChangerOptions.length; i++) {
            sizeSelect += `<option value="${sizeChangerOptions[i]}"${(sizeChangerOptions[i] === pageSize ? ' selected' : '')}>${sizeChangerOptions[i]} / page</option>`;
          }
          sizeSelect += `</select>`;
          formattedString = sizeSelect;

          if (formatSizeChanger) {
            formattedString = self.replaceVariables(formatSizeChanger, {
              length: sizeSelect,
              total: totalNumber
            });
          }
          html += `<div class="paginationjs-size-changer">${formattedString}</div>`;
        }
      }

      // Whether to display Go input
      if (showGoInput) {
        if (formatGoInput) {
          formattedString = self.replaceVariables(formatGoInput, {
            currentPage: currentPage,
            totalPage: totalPage,
            totalNumber: totalNumber,
            input: goInput
          });
          html += `<div class="${classPrefix}-go-input">${formattedString}</div>`;
        }
      }

      // Whether to display Go button
      if (showGoButton) {
        if (formatGoButton) {
          formattedString = self.replaceVariables(formatGoButton, {
            currentPage: currentPage,
            totalPage: totalPage,
            totalNumber: totalNumber,
            button: goButton
          });
          html += `<div class="${classPrefix}-go-button">${formattedString}</div>`;
        }
      }

      // Append extra contents to the pagination buttons
      if (footer) {
        formattedString = self.replaceVariables(footer, {
          currentPage: currentPage,
          totalPage: totalPage,
          totalNumber: totalNumber
        });
        html += formattedString;
      }

      return html;
    },

    findTotalNumberFromRemoteResponse: function (response) {
      this.model.totalNumber = this.attributes.totalNumberLocator(response);
    },

    go: function (number, callback) {
      var self = this;
      var model = self.model;

      if (self.disabled) return;

      var pageNumber = number;
      pageNumber = parseInt(pageNumber);

      if (!pageNumber || pageNumber < 1) return;

      var pageSize = self.attributes.pageSize;
      var totalNumber = self.getTotalNumber();
      var totalPage = self.getTotalPage();

      if (totalNumber > 0 && pageNumber > totalPage) return;

      // Pick paging data in synchronous mode
      if (!self.isAsync) {
        render(self.getPagingData(pageNumber));
        return;
      }

      var postData = {};
      var alias = self.attributes.alias || {};
      var pageSizeName = alias.pageSize ? alias.pageSize : 'pageSize';
      var pageNumberName = alias.pageNumber ? alias.pageNumber : 'pageNumber';
      postData[pageSizeName] = pageSize;
      postData[pageNumberName] = pageNumber;

      var ajaxParams = typeof self.attributes.ajax === 'function' ? self.attributes.ajax() : self.attributes.ajax;

      // If the pageNumber's value starts with 0 via Ajax
      if (ajaxParams && ajaxParams.pageNumberStartWithZero) {
        postData[pageNumberName] = pageNumber - 1;
      }

      var formatAjaxParams = {
        type: 'get',
        cache: false,
        data: {},
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        dataType: 'json',
        async: true
      };

      deepExtend(formatAjaxParams, ajaxParams);
      extend(formatAjaxParams.data, postData);

      formatAjaxParams.url = self.attributes.dataSource;
      formatAjaxParams.success = function (response) {
        try {
          self.model.originalResponse = response;
          if (self.isDynamicTotalNumber) {
            self.findTotalNumberFromRemoteResponse(response);
          } else {
            self.model.totalNumber = self.attributes.totalNumber;
          }

          var finalData = self.filterDataWithLocator(response);
          render(finalData);
        } catch (e) {
          if (typeof self.attributes.onError === 'function') {
            self.attributes.onError(e, 'ajaxSuccessHandlerError');
          } else {
            throw e;
          }
        }
      };
      formatAjaxParams.error = function (jqXHR, textStatus, errorThrown) {
        self.attributes.formatAjaxError && self.attributes.formatAjaxError(jqXHR, textStatus, errorThrown);
        self.enable();
      };

      self.disable();

      if (self.attributes.ajaxFunction) {
        self.attributes.ajaxFunction(formatAjaxParams);
      } else {
        // Vanilla AJAX implementation
        var xhr = new XMLHttpRequest();
        var url = formatAjaxParams.url;
        var method = formatAjaxParams.type.toUpperCase();

        if (method === 'GET') {
          var params = [];
          for (var key in formatAjaxParams.data) {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(formatAjaxParams.data[key]));
          }
          if (params.length > 0) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + params.join('&');
          }
        }

        xhr.open(method, url, formatAjaxParams.async);
        xhr.setRequestHeader('Content-Type', formatAjaxParams.contentType);

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              var response = JSON.parse(xhr.responseText);
              formatAjaxParams.success(response);
            } else {
              formatAjaxParams.error(xhr, 'error', xhr.statusText);
            }
          }
        };

        if (method === 'POST') {
          var postParams = [];
          for (var key in formatAjaxParams.data) {
            postParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(formatAjaxParams.data[key]));
          }
          xhr.send(postParams.join('&'));
        } else {
          xhr.send();
        }
      }

      function render(data) {
        if (self.callHook('beforePaging', pageNumber) === false) return false;

        // Pagination direction
        model.direction = typeof model.pageNumber === 'undefined' ? 0 : (pageNumber > model.pageNumber ? 1 : -1);

        model.pageNumber = pageNumber;

        self.render();

        if (self.disabled && self.isAsync) {
          // enable pagination
          self.enable();
        }

        // cache model data
        self.container.paginationData.model = model;

        // format result data before callback invoked
        if (self.attributes.formatResult) {
          // Check if data contains DOM elements
          var cloneData;
          if (data.length > 0 && data[0] instanceof Element) {
            // For DOM elements, create a shallow copy
            cloneData = Array.from(data);
          } else {
            // For regular data, use JSON clone
            cloneData = JSON.parse(JSON.stringify(data));
          }
          if (!Helpers.isArray(data = self.attributes.formatResult(cloneData))) {
            data = cloneData;
          }
        }

        self.container.paginationData.currentPageData = data;

        self.doCallback(data, callback);

        self.callHook('afterPaging', pageNumber);

        if (pageNumber == 1) {
          self.callHook('afterIsFirstPage');
        } else if (pageNumber == self.getTotalPage()) {
          self.callHook('afterIsLastPage');
        }
      }
    },

    doCallback: function (data, customCallback) {
      var self = this;
      var model = self.model;

      if (typeof customCallback === 'function') {
        customCallback(data, model);
      } else if (typeof self.attributes.callback === 'function') {
        self.attributes.callback(data, model);
      }
    },

    destroy: function () {
      if (this.callHook('beforeDestroy') === false) return;

      // Clear breakpoint resize timeout
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.model.el.remove();
      this.container.paginationData = {};

      // Remove style element
      var styleElement = document.getElementById('paginationjs-style');
      if (styleElement) {
        styleElement.remove();
      }

      this.callHook('afterDestroy');
    },

    previous: function (callback) {
      this.go(this.model.pageNumber - 1, callback);
    },

    next: function (callback) {
      this.go(this.model.pageNumber + 1, callback);
    },

    disable: function () {
      var self = this;
      var source = self.isAsync ? 'async' : 'sync';

      if (self.callHook('beforeDisable', source) === false) return;

      self.disabled = true;
      self.model.disabled = true;

      self.callHook('afterDisable', source);
    },

    enable: function () {
      var self = this;
      var source = self.isAsync ? 'async' : 'sync';

      if (self.callHook('beforeEnable', source) === false) return;

      self.disabled = false;
      self.model.disabled = false;

      self.callHook('afterEnable', source);
    },

    refresh: function (callback) {
      this.go(this.model.pageNumber, callback);
    },

    show: function () {
      var self = this;

      if (self.model.el.style.display !== 'none') return;

      self.model.el.style.display = 'block';
    },

    hide: function () {
      var self = this;

      if (self.model.el.style.display === 'none') return;

      self.model.el.style.display = 'none';
    },

    replaceVariables: function (template, variables) {
      var formattedString;

      for (var key in variables) {
        var value = variables[key];
        var regexp = new RegExp('<%=\\s*' + key + '\\s*%>', 'img');

        formattedString = (formattedString || template).replace(regexp, value);
      }

      return formattedString;
    },

    getPagingData: function (number) {
      var pageSize = this.attributes.pageSize;
      var dataSource = this.attributes.dataSource;
      var totalNumber = this.getTotalNumber();

      var start = pageSize * (number - 1) + 1;
      var end = Math.min(number * pageSize, totalNumber);

      // Check if dataSource contains DOM elements
      if (dataSource.length > 0 && dataSource[0] instanceof Element) {
        return dataSource.slice(start - 1, end);
      }

      return dataSource.slice(start - 1, end);
    },

    getTotalNumber: function () {
      return this.model.totalNumber || this.attributes.totalNumber || 0;
    },

    getTotalPage: function () {
      return Math.ceil(this.getTotalNumber() / this.attributes.pageSize);
    },

    getLocator: function (locator) {
      var result;

      if (typeof locator === 'string') {
        result = locator;
      } else if (typeof locator === 'function') {
        result = locator();
      } else {
        throwError('"locator" is incorrect. Expect string or function type.');
      }

      return result;
    },

    filterDataWithLocator: function (dataSource) {
      var locator = this.getLocator(this.attributes.locator);
      var filteredData;

      // Datasource is an Object, use "locator" to locate available data
      if (Helpers.isObject(dataSource)) {
        try {
          var locatorParts = locator.split('.');
          for (var i = 0; i < locatorParts.length; i++) {
            filteredData = (filteredData ? filteredData : dataSource)[locatorParts[i]];
          }
        }
        catch (e) {
          // ignore
        }

        if (!filteredData) {
          throwError('dataSource.' + locator + ' is undefined.');
        } else if (!Helpers.isArray(filteredData)) {
          throwError('dataSource.' + locator + ' should be an Array.');
        }
      }

      return filteredData || dataSource;
    },

    parseDataSource: function (dataSource, callback) {
      var self = this;

      if (Helpers.isObject(dataSource)) {
        callback(self.attributes.dataSource = self.filterDataWithLocator(dataSource));
      } else if (Helpers.isArray(dataSource)) {
        callback(self.attributes.dataSource = dataSource);
      } else if (typeof dataSource === 'function') {
        dataSource(function (data) {
          if (!Helpers.isArray(data)) {
            throwError('The parameter of "done" Function should be an Array.');
          }
          self.parseDataSource.call(self, data, callback);
        });
      } else if (typeof dataSource === 'string') {
        if (/^https?|file:/.test(dataSource)) {
          self.attributes.ajaxDataType = 'jsonp';
        }
        callback(dataSource);
      } else {
        throwError('Unexpected dataSource type');
      }
    },

    callHook: function (hook) {
      var paginationData = this.container.paginationData || {};
      var result;

      var args = Array.prototype.slice.apply(arguments);
      args.shift();

      if (this.attributes[hook] && typeof this.attributes[hook] === 'function') {
        if (this.attributes[hook].apply(global, args) === false) {
          result = false;
        }
      }

      if (paginationData.hooks && paginationData.hooks[hook]) {
        paginationData.hooks[hook].forEach(function (item) {
          if (item.apply(global, args) === false) {
            result = false;
          }
        });
      }

      return result !== false;
    },

    initializeBreakpoints: function () {
      var self = this;

      // Get current breakpoint configuration
      var currentConfig = self.getCurrentBreakpointConfig();

      // Apply breakpoint configuration
      self.applyBreakpointConfig(currentConfig);

      // Listen for window resize
      addEvent(window, 'resize', function () {
        self.handleResize();
      });
    },

    getCurrentBreakpointConfig: function () {
      var self = this;
      var width = window.innerWidth;

      var sortedBreakpoints = Object.keys(self.breakpoints)
        .map(Number)
        .sort(function (a, b) { return b - a; });

      for (var i = 0; i < sortedBreakpoints.length; i++) {
        var breakpoint = sortedBreakpoints[i];
        if (width >= breakpoint) {
          var result = {
            breakpoint: breakpoint,
            config: self.breakpoints[breakpoint]
          };
          return result;
        }
      }

      return null;
    },

    applyBreakpointConfig: function (breakpointData) {
      var self = this;

      if (!breakpointData) {
        return;
      }

      var newConfig = breakpointData.config;
      var breakpoint = breakpointData.breakpoint;

      // Check if configuration actually changed
      if (self.currentBreakpoint === breakpoint) {
        return;
      }

      self.currentBreakpoint = breakpoint;

      // Apply new configuration
      for (var key in newConfig) {
        if (newConfig.hasOwnProperty(key)) {
          self.attributes[key] = newConfig[key];

          // Update model for critical properties
          if (key === 'pageSize') {
            self.model.pageSize = newConfig[key];
          } else if (key === 'pageRange') {
            self.model.pageRange = newConfig[key];
          }
        }
      }

      // Re-render pagination
      self.render();

      // Trigger callback if exists
      if (typeof self.attributes.callback === 'function') {
        var currentData = self.getPagingData(self.model.pageNumber || self.attributes.pageNumber);
        self.attributes.callback(currentData, self.model);
      }
    },

    handleResize: function () {
      var self = this;
      var newBreakpointConfig = self.getCurrentBreakpointConfig();

      if (newBreakpointConfig && newBreakpointConfig.breakpoint !== self.currentBreakpoint) {
        self.applyBreakpointConfig(newBreakpointConfig);
      }
    },

    observer: function () {
      var self = this;
      var el = self.model.el;

      // Go to specified page number
      addEvent(self.container, eventPrefix + 'go', function (event) {
        var pageNumber = event.detail;
        if (typeof pageNumber === 'string') {
          pageNumber = parseInt(pageNumber.trim());
        }

        if (!pageNumber) return;

        if (typeof pageNumber !== 'number') {
          throwError('"pageNumber" is incorrect. (Number)');
        }

        self.go(pageNumber);
      });

      // Page number button click listener
      addEvent(el, 'click', function (event) {
        var target = event.target.closest('.J-paginationjs-page');
        if (!target) return;

        var pageNumber = target.getAttribute('data-num');
        if (pageNumber) pageNumber = pageNumber.trim();

        if (!pageNumber || target.classList.contains(self.attributes.disableClassName) || target.classList.contains(self.attributes.activeClassName)) return;

        if (self.callHook('beforePageOnClick', event, pageNumber) === false) return false;

        self.go(pageNumber);

        self.callHook('afterPageOnClick', event, pageNumber);

        if (!self.attributes.pageLink) {
          event.preventDefault();
          return false;
        }
      });

      // Previous button click listener
      addEvent(el, 'click', function (event) {
        var target = event.target.closest('.J-paginationjs-previous');
        if (!target) return;

        var pageNumber = target.getAttribute('data-num');
        if (pageNumber) pageNumber = pageNumber.trim();

        if (!pageNumber || target.classList.contains(self.attributes.disableClassName)) return;

        if (self.callHook('beforePreviousOnClick', event, pageNumber) === false) return false;

        self.go(pageNumber);

        self.callHook('afterPreviousOnClick', event, pageNumber);

        if (!self.attributes.pageLink) {
          event.preventDefault();
          return false;
        }
      });

      // Next button click listener
      addEvent(el, 'click', function (event) {
        var target = event.target.closest('.J-paginationjs-next');
        if (!target) return;

        var pageNumber = target.getAttribute('data-num');
        if (pageNumber) pageNumber = pageNumber.trim();

        if (!pageNumber || target.classList.contains(self.attributes.disableClassName)) return;

        if (self.callHook('beforeNextOnClick', event, pageNumber) === false) return false;

        self.go(pageNumber);

        self.callHook('afterNextOnClick', event, pageNumber);

        if (!self.attributes.pageLink) {
          event.preventDefault();
          return false;
        }
      });

      // Go button click listener
      addEvent(el, 'click', function (event) {
        var target = event.target.closest('.J-paginationjs-go-button');
        if (!target) return;

        var pageNumber = el.querySelector('.J-paginationjs-go-pagenumber').value;

        if (self.callHook('beforeGoButtonOnClick', event, pageNumber) === false) return false;

        triggerEvent(self.container, eventPrefix + 'go', pageNumber);

        self.callHook('afterGoButtonOnClick', event, pageNumber);
      });

      // go input enter keyup listener
      addEvent(el, 'keyup', function (event) {
        if (event.target.classList.contains('J-paginationjs-go-pagenumber') && event.which === 13) {
          var pageNumber = event.target.value;

          if (self.callHook('beforeGoInputOnEnter', event, pageNumber) === false) return false;

          triggerEvent(self.container, eventPrefix + 'go', pageNumber);

          // Maintain the cursor
          el.querySelector('.J-paginationjs-go-pagenumber').focus();

          self.callHook('afterGoInputOnEnter', event, pageNumber);
        }
      });

      addEvent(el, 'change', function (event) {
        if (!event.target.classList.contains('J-paginationjs-size-select')) return;

        var size = parseInt(event.target.value);
        var currentPage = self.model.pageNumber || self.attributes.pageNumber;

        if (typeof size !== 'number') return;

        if (self.callHook('beforeSizeSelectorChange', event, size) === false) return false;

        self.attributes.pageSize = size;
        self.model.pageSize = size;
        self.model.totalPage = self.getTotalPage();
        if (currentPage > self.model.totalPage) {
          currentPage = self.model.totalPage;
        }
        self.go(currentPage);

        self.callHook('afterSizeSelectorChange', event, size);

        if (!self.attributes.pageLink) {
          event.preventDefault();
          return false;
        }
      });

      // Previous page
      addEvent(self.container, eventPrefix + 'previous', function (event) {
        self.previous();
      });

      // Next page
      addEvent(self.container, eventPrefix + 'next', function (event) {
        self.next();
      });

      // Disable
      addEvent(self.container, eventPrefix + 'disable', function (event) {
        self.disable();
      });

      // Enable
      addEvent(self.container, eventPrefix + 'enable', function (event) {
        self.enable();
      });

      // Refresh
      addEvent(self.container, eventPrefix + 'refresh', function (event) {
        self.refresh();
      });

      // Show
      addEvent(self.container, eventPrefix + 'show', function (event) {
        self.show();
      });

      // Hide
      addEvent(self.container, eventPrefix + 'hide', function (event) {
        self.hide();
      });

      // Destroy
      addEvent(self.container, eventPrefix + 'destroy', function (event) {
        self.destroy();
      });

      // Whether to load the default page
      var validTotalPage = Math.max(self.getTotalPage(), 1);
      var defaultPageNumber = self.attributes.pageNumber;

      // Default pageNumber should be 1 when totalNumber is dynamic
      if (self.isDynamicTotalNumber) {
        if (self.attributes.resetPageNumberOnInit) defaultPageNumber = 1;
      }

      if (self.attributes.triggerPagingOnInit) {
        triggerEvent(self.container, eventPrefix + 'go', Math.min(defaultPageNumber, validTotalPage));
      }
    }
  };

  // Instance defaults
  Pagination.defaults = {

    // Data source
    // Array | String | Function | Object
    //dataSource: '',

    // String | Function
    //locator: 'data',

    // Function
    //totalNumberLocator: function() {},

    // Total number of data items
    totalNumber: 0,

    // Default page number
    pageNumber: 1,

    // Number of data items per page
    pageSize: 10,

    // Page range (pages around current page)
    pageRange: 2,

    // Whether to display the 'Previous' button
    showPrevious: true,

    // Whether to display the 'Next' button
    showNext: true,

    // Whether to display the page buttons
    showPageNumbers: true,

    showNavigator: false,

    // Whether to display the 'Go' input
    showGoInput: false,

    // Whether to display the 'Go' button
    showGoButton: false,

    showSizeChanger: false,

    sizeChangerOptions: [10, 20, 50, 100],

    // Page link
    pageLink: '',

    // 'Previous' text
    prevText: '&lsaquo;',

    // 'Next' text
    nextText: '&rsaquo;',

    // Ellipsis text
    ellipsisText: '...',

    // 'Go' button text
    goButtonText: 'Go',

    // Additional class name(s) for the Pagination container
    //className: '',

    classPrefix: 'paginationjs',

    activeClassName: 'active',

    // class name when disabled
    disableClassName: 'disabled',

    //ulClassName: '',

    //pageClassName: '',

    //prevClassName: '',

    //nextClassName: '',

    formatNavigator: 'Total <%= totalNumber %> items',

    formatGoInput: '<%= input %>',

    formatGoButton: '<%= button %>',

    // position in the container
    position: 'bottom',

    // Auto hide previous button when current page is the first
    autoHidePrevious: false,

    // Auto hide next button when current page is the last
    autoHideNext: false,

    //header: '',

    //footer: '',

    //alias: {},

    // Whether to trigger pagination at initialization
    triggerPagingOnInit: true,

    // Whether to reset page number at initialization, it works only if dataSource is a URL and totalNumberLocator is specified
    resetPageNumberOnInit: true,

    // Whether to hide pagination when less than one page
    hideOnlyOnePage: false,

    hideFirstOnEllipsisShow: false,

    hideLastOnEllipsisShow: false,

    // Customize item's innerHTML
    callback: function () { }
  };

  // Hook register
  Pagination.prototype.addHook = function (hook, callback) {
    if (arguments.length < 2) {
      throwError('Expect 2 arguments at least.');
    }

    if (typeof callback !== 'function') {
      throwError('callback should be a function.');
    }

    var paginationData = this.container.paginationData;

    if (!paginationData) {
      this.container.paginationData = {};
      paginationData = this.container.paginationData;
    }

    if (!paginationData.hooks) {
      paginationData.hooks = {};
    }

    if (!paginationData.hooks[hook]) {
      paginationData.hooks[hook] = [];
    }

    paginationData.hooks[hook].push(callback);
  };

  // Static method
  Pagination.create = function (selector, options) {
    if (arguments.length < 2) {
      throwError('Requires two parameters.');
    }

    var container;

    // 'selector' is a DOM element
    if (typeof selector !== 'string' && selector instanceof Element) {
      container = selector;
    } else {
      container = document.querySelector(selector);
    }

    if (!container) return;

    return new Pagination(container, options);
  };

  // Check parameters
  function parameterChecker(args) {
    if (!args.dataSource) {
      throwError('"dataSource" is required.');
    }

    if (typeof args.dataSource === 'string') {
      if (args.totalNumberLocator === undefined) {
        if (args.totalNumber === undefined) {
          throwError('"totalNumber" is required.');
        } else if (!isNumeric(args.totalNumber)) {
          throwError('"totalNumber" is incorrect. Expect numberic type');
        }
      } else {
        if (typeof args.totalNumberLocator !== 'function') {
          throwError('"totalNumberLocator" should be a Function.');
        }
      }
    } else if (Helpers.isObject(args.dataSource)) {
      if (typeof args.locator === 'undefined') {
        throwError('"dataSource" is an Object, please specify a "locator".');
      } else if (typeof args.locator !== 'string' && typeof args.locator !== 'function') {
        throwError('' + args.locator + ' is incorrect. Expect string or function type');
      }
    }

    if (args.formatResult !== undefined && typeof args.formatResult !== 'function') {
      throwError('"formatResult" should be a Function.');
    }

    if (args.onError !== undefined && typeof args.onError !== 'function') {
      throwError('"onError" should be a Function.');
    }
  }

  // Export to global scope
  global.PaginDataJS = Pagination;

  // AMD support
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Pagination;
    });
  }

  // CommonJS support
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
  }

})(this); 
