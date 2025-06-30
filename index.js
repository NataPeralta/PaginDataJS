const DEFAULT_OPTIONS = {
  totalNumber: 0,
  pageNumber: 1,
  pageSize: 10,
  pageRange: 2,
  showPrevious: true,
  showNext: true,
  showPageNumbers: true,
  showNavigator: false,
  showGoInput: false,
  showGoButton: false,
  showSizeChanger: false,
  sizeChangerOptions: [10, 20, 50, 100],
  pageLink: "",
  prevText: "&lsaquo;",
  nextText: "&rsaquo;",
  ellipsisText: "...",
  goButtonText: "Go",
  classPrefix: "paginationjs",
  activeClassName: "active",
  disableClassName: "disabled",
  formatNavigator: "Total <%= totalNumber %> items",
  formatGoInput: "<%= input %>",
  formatGoButton: "<%= button %>",
  position: "bottom",
  autoHidePrevious: false,
  autoHideNext: false,
  triggerPagingOnInit: true,
  resetPageNumberOnInit: true,
  hideOnlyOnePage: false,
  hideFirstOnEllipsisShow: false,
  hideLastOnEllipsisShow: false,
  groupItems: false,
  groupClass: "pagination-group",
  showEllipsis: false
};
function mergeOptions(options) {
  return { ...DEFAULT_OPTIONS, ...options };
}
function replaceVariables(template, variables) {
  let formattedString = template;
  for (const [key, value] of Object.entries(variables)) {
    const regexp = new RegExp("<%=\\s*" + key + "\\s*%>", "img");
    formattedString = formattedString.replace(regexp, value);
  }
  return formattedString;
}
function getLocator(locator) {
  if (typeof locator === "string") {
    return locator;
  } else if (typeof locator === "function") {
    return locator();
  } else {
    throw new Error('"locator" is incorrect. Expect string or function type.');
  }
}
function filterDataWithLocator(dataSource, locator) {
  if (Array.isArray(dataSource)) {
    return dataSource;
  }
  if (!locator) {
    return dataSource;
  }
  const locatorPath = getLocator(locator);
  let filteredData;
  if (typeof dataSource === "object") {
    try {
      const parts = locatorPath.split(".");
      for (const part of parts) {
        filteredData = (filteredData ? filteredData : dataSource)[part];
      }
    } catch (e) {
    }
    if (!filteredData) {
      throw new Error("dataSource." + locatorPath + " is undefined.");
    } else if (!Array.isArray(filteredData)) {
      throw new Error("dataSource." + locatorPath + " should be an Array.");
    }
  }
  return filteredData || dataSource;
}
function generateElipsisHTML(classPrefix, ellipsisText) {
  return `<li class="${classPrefix}-ellipsis"><a>${ellipsisText}</a></li>`;
}
function generatePageHTML({
  classPrefix,
  pageNumber,
  isActive = false,
  activeClassName
}) {
  const activeClass = isActive && activeClassName ? ` ${activeClassName}` : "";
  return `<li class="${classPrefix}-page${activeClass}" data-num="${pageNumber}"><a>${pageNumber}</a></li>`;
}
function generateBackHTML(classPrefix, pageNumber, text, options) {
  return `<li class="${classPrefix}-prev ${options.nextClassName || ""}" title="Previous page" data-num="${pageNumber}"><a>${text}</a></li>`;
}
function generateNextHTML(classPrefix, pageNumber, text, options) {
  return `<li class="${classPrefix}-next ${options.nextClassName || ""}" title="Next page" data-num="${pageNumber}"><a>${text}</a></li>`;
}
function generateHTML(args, options) {
  const currentPage = args.currentPage;
  const pagesToShow = args.pagesToShow;
  args.rangeStart;
  args.rangeEnd;
  const totalPage = args.totalPage;
  let html = "";
  let sizeSelect = `<select class="${options.classPrefix}-size-select">`;
  const goInput = `<input type="text" class="${options.classPrefix}-go-pagenumber">`;
  const goButton = `<input type="button" class="${options.classPrefix}-go-button" value="${options.goButtonText}">`;
  let formattedString;
  const formatSizeChanger = typeof options.formatSizeChanger === "function" ? options.formatSizeChanger(sizeSelect, options.totalNumber) : options.formatSizeChanger;
  const formatNavigator = typeof options.formatNavigator === "function" ? options.formatNavigator(currentPage, totalPage, options.totalNumber) : options.formatNavigator;
  const formatGoInput = typeof options.formatGoInput === "function" ? options.formatGoInput(goInput, currentPage, totalPage, options.totalNumber) : options.formatGoInput;
  const formatGoButton = typeof options.formatGoButton === "function" ? options.formatGoButton(goButton, currentPage, totalPage, options.totalNumber) : options.formatGoButton;
  typeof options.autoHidePrevious === "function" ? options.autoHidePrevious() : options.autoHidePrevious;
  typeof options.autoHideNext === "function" ? options.autoHideNext() : options.autoHideNext;
  const header = typeof options.header === "function" ? options.header(currentPage, totalPage, options.totalNumber) : options.header;
  const footer = typeof options.footer === "function" ? options.footer(currentPage, totalPage, options.totalNumber) : options.footer;
  if (header) {
    formattedString = replaceVariables(header, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber
    });
    html += formattedString;
  }
  if (options.showNavigator && formatNavigator) {
    formattedString = replaceVariables(formatNavigator, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber,
      rangeStart: (currentPage - 1) * options.pageSize + 1,
      rangeEnd: Math.min(currentPage * options.pageSize, options.totalNumber)
    });
    html += `<div class="${options.classPrefix}-nav">${formattedString}</div>`;
  }
  if (options.showPrevious || options.showPageNumbers || options.showNext) {
    html += '<div class="paginationjs-pages">';
    html += options.ulClassName ? `<ul class="${options.ulClassName}">` : "<ul>";
    if (options.showPrevious) {
      html += generateBackHTML(
        options.classPrefix,
        currentPage - 1,
        options.prevText || "",
        options
      );
    }
    if (options.showPageNumbers) {
      if (pagesToShow && pagesToShow.length > 0) {
        pagesToShow.forEach((item) => {
          if (typeof item === "number") {
            html += generatePageHTML({
              classPrefix: options.classPrefix,
              pageNumber: item,
              isActive: item === currentPage,
              activeClassName: options.activeClassName
            });
          } else if (item === "createElipsisHTML") {
            html += generateElipsisHTML(options.classPrefix, options.ellipsisText);
          }
        });
      } else {
        for (let i = 1; i <= totalPage; i++) {
          html += generatePageHTML({
            classPrefix: options.classPrefix,
            pageNumber: i,
            isActive: i === currentPage,
            activeClassName: options.activeClassName
          });
        }
      }
    }
    if (options.showNext) {
      html += generateNextHTML(
        options.classPrefix,
        currentPage + 1,
        options.nextText || "",
        options
      );
    }
    html += "</ul></div>";
  }
  if (options.showSizeChanger && Array.isArray(options.sizeChangerOptions)) {
    if (options.sizeChangerOptions.indexOf(options.pageSize) === -1) {
      options.sizeChangerOptions.unshift(options.pageSize);
      options.sizeChangerOptions.sort((a, b) => a - b);
    }
    for (let i = 0; i < options.sizeChangerOptions.length; i++) {
      sizeSelect += `<option value="${options.sizeChangerOptions[i]}"${options.sizeChangerOptions[i] === options.pageSize ? " selected" : ""}>${options.sizeChangerOptions[i]} / page</option>`;
    }
    sizeSelect += "</select>";
    formattedString = sizeSelect;
    if (formatSizeChanger) {
      formattedString = replaceVariables(formatSizeChanger, {
        length: sizeSelect,
        total: options.totalNumber
      });
    }
    html += `<div class="paginationjs-size-changer">${formattedString}</div>`;
  }
  if (options.showGoInput && formatGoInput) {
    formattedString = replaceVariables(formatGoInput, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber,
      input: goInput
    });
    html += `<div class="${options.classPrefix}-go-input">${formattedString}</div>`;
  }
  if (options.showGoButton && formatGoButton) {
    formattedString = replaceVariables(formatGoButton, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber,
      button: goButton
    });
    html += `<div class="${options.classPrefix}-go-button">${formattedString}</div>`;
  }
  if (footer) {
    formattedString = replaceVariables(footer, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber
    });
    html += formattedString;
  }
  return html;
}
class EventHandler {
  constructor(options, model, el) {
    this.options = options;
    this.model = model;
    this.el = el;
  }
  bindEvents() {
    this.bindPageClick();
    this.bindSizeChanger();
    this.bindGoButton();
    this.bindGoInput();
    this.bindEllipsisEvents();
  }
  bindPageClick() {
    const classPrefix = this.options.classPrefix || "paginationjs";
    this.el.addEventListener("click", (e) => {
      const target = e.target;
      const pageElement = target.closest(`.${classPrefix}-page`);
      if (pageElement && !pageElement.classList.contains(this.options.disableClassName || "disabled")) {
        const pageNumber = parseInt(pageElement.getAttribute("data-num") || "1");
        this.goToPage(pageNumber);
        return;
      }
      const prevElement = target.closest(`.${classPrefix}-prev`);
      if (prevElement && !prevElement.classList.contains(this.options.disableClassName || "disabled")) {
        const pageNumber = parseInt(prevElement.getAttribute("data-num") || "1");
        this.goToPage(pageNumber);
        return;
      }
      const nextElement = target.closest(`.${classPrefix}-next`);
      if (nextElement && !nextElement.classList.contains(this.options.disableClassName || "disabled")) {
        const pageNumber = parseInt(nextElement.getAttribute("data-num") || "1");
        this.goToPage(pageNumber);
        return;
      }
    });
  }
  bindSizeChanger() {
    if (!this.options.showSizeChanger) return;
    const classPrefix = this.options.classPrefix || "paginationjs";
    const sizeSelector = this.el.querySelector(`.${classPrefix}-size-select`);
    if (sizeSelector) {
      sizeSelector.addEventListener("change", (e) => {
        const target = e.target;
        const size = parseInt(target.value);
        if (this.options.beforeSizeSelectorChange) {
          const result = this.options.beforeSizeSelectorChange(e, size);
          if (result === false) return;
        }
        this.model.pageSize = size;
        this.model.pageNumber = 1;
        this.triggerPaging();
        if (this.options.afterSizeSelectorChange) {
          this.options.afterSizeSelectorChange(e, size);
        }
      });
    }
  }
  bindGoButton() {
    if (!this.options.showGoButton) return;
    const classPrefix = this.options.classPrefix || "paginationjs";
    const goButton = this.el.querySelector(`.${classPrefix}-go-button`);
    if (goButton) {
      goButton.addEventListener("click", (e) => {
        const pageNumber = this.getGoInputValue();
        if (this.options.beforeGoButtonOnClick) {
          const result = this.options.beforeGoButtonOnClick(e, pageNumber);
          if (result === false) return;
        }
        this.goToPage(parseInt(pageNumber));
        if (this.options.afterGoButtonOnClick) {
          this.options.afterGoButtonOnClick(e, pageNumber);
        }
      });
    }
  }
  bindGoInput() {
    if (!this.options.showGoInput) return;
    const classPrefix = this.options.classPrefix || "paginationjs";
    const goInput = this.el.querySelector(`.${classPrefix}-go-pagenumber`);
    if (goInput) {
      goInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const pageNumber = this.getGoInputValue();
          if (this.options.beforeGoInputOnEnter) {
            const result = this.options.beforeGoInputOnEnter(e, pageNumber);
            if (result === false) return;
          }
          this.goToPage(parseInt(pageNumber));
          if (this.options.afterGoInputOnEnter) {
            this.options.afterGoInputOnEnter(e, pageNumber);
          }
        }
      });
    }
  }
  getGoInputValue() {
    const classPrefix = this.options.classPrefix || "paginationjs";
    const goInput = this.el.querySelector(`.${classPrefix}-go-pagenumber`);
    return goInput ? goInput.value : "1";
  }
  goToPage(pageNumber) {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPage) {
      pageNumber = totalPage;
    }
    if (pageNumber !== this.model.pageNumber) {
      this.model.pageNumber = pageNumber;
      this.triggerPaging();
    }
  }
  triggerPaging() {
    const event = new CustomEvent("pagination", {
      detail: {
        pageNumber: this.model.pageNumber
      }
    });
    this.el.dispatchEvent(event);
  }
  bindEllipsisEvents() {
    if (!this.options.ellipsisClickable) return;
    const classPrefix = this.options.classPrefix || "paginationjs";
    this.el.addEventListener("click", (e) => {
      const target = e.target;
      const ellipsisButton = target.closest(`.${classPrefix}-ellipsis-go-btn`);
      if (ellipsisButton) {
        const ellipsisContainer = ellipsisButton.closest(`.${classPrefix}-ellipsis`);
        const input = ellipsisContainer.querySelector(
          `.${classPrefix}-ellipsis-page-input`
        );
        if (input && input.value) {
          const pageNumber = parseInt(input.value);
          this.goToPage(pageNumber);
          input.value = "";
        }
      }
    });
    this.el.addEventListener("keypress", (e) => {
      const target = e.target;
      if (target.classList.contains(`${classPrefix}-ellipsis-page-input`) && e.key === "Enter") {
        const input = target;
        if (input.value) {
          const pageNumber = parseInt(input.value);
          this.goToPage(pageNumber);
          input.value = "";
        }
      }
    });
  }
}
class DataHandler {
  constructor(options, model) {
    this.options = options;
    this.model = model;
  }
  async getData() {
    const dataSource = this.options.dataSource;
    if (!dataSource) {
      return [];
    }
    if (Array.isArray(dataSource)) {
      return this.processArrayData(dataSource);
    }
    if (typeof dataSource === "function") {
      return this.processFunctionData(dataSource);
    }
    if (typeof dataSource === "string") {
      return this.processAjaxData(dataSource);
    }
    return [];
  }
  processArrayData(data) {
    const filteredData = filterDataWithLocator(data, this.options.locator);
    this.model.totalNumber = filteredData.length;
    if (this.options.groupItems) {
      return this.groupData(filteredData);
    }
    return this.paginateData(filteredData);
  }
  async processFunctionData(dataFunction) {
    return new Promise((resolve) => {
      dataFunction((data) => {
        const filteredData = filterDataWithLocator(data, this.options.locator);
        this.model.totalNumber = filteredData.length;
        if (this.options.groupItems) {
          resolve(this.groupData(filteredData));
        } else {
          resolve(this.paginateData(filteredData));
        }
      });
    });
  }
  async processAjaxData(url) {
    const ajaxOptions = this.getAjaxOptions();
    try {
      const response = await this.makeAjaxRequest(url, ajaxOptions);
      const data = this.processAjaxResponse(response);
      const filteredData = filterDataWithLocator(data, this.options.locator);
      if (this.options.totalNumberLocator) {
        this.model.totalNumber = this.options.totalNumberLocator(response);
      } else {
        this.model.totalNumber = filteredData.length;
      }
      if (this.options.groupItems) {
        return this.groupData(filteredData);
      }
      return this.paginateData(filteredData);
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, "ajax");
      }
      return [];
    }
  }
  getAjaxOptions() {
    const ajax = this.options.ajax;
    if (typeof ajax === "function") {
      return ajax();
    }
    return ajax || {};
  }
  async makeAjaxRequest(url, options) {
    const { type = "GET", data, contentType, dataType, async = true, cache = true } = options;
    const requestOptions = {
      method: type,
      headers: {
        "Content-Type": contentType || "application/x-www-form-urlencoded"
      }
    };
    if (type === "POST" && data) {
      requestOptions.body = typeof data === "string" ? data : JSON.stringify(data);
    }
    if (!cache) {
      requestOptions.cache = "no-cache";
    }
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (dataType === "json") {
      return response.json();
    }
    return response.text();
  }
  processAjaxResponse(response) {
    if (Array.isArray(response)) {
      return response;
    }
    if (typeof response === "string") {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    }
    return response;
  }
  paginateData(data) {
    const startIndex = (this.model.pageNumber - 1) * this.model.pageSize;
    const endIndex = startIndex + this.model.pageSize;
    const pageData = data.slice(startIndex, endIndex);
    if (data.length > 0 && data[0] instanceof HTMLElement) {
      data.forEach((item) => {
        item.setAttribute("hidden", "");
      });
      pageData.forEach((item) => {
        item.removeAttribute("hidden");
      });
    }
    return pageData;
  }
  groupData(data) {
    const groupedData = [];
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    for (let i = 1; i <= totalPage; i++) {
      const startIndex = (i - 1) * this.model.pageSize;
      const endIndex = startIndex + this.model.pageSize;
      const pageData = data.slice(startIndex, endIndex);
      if (i === this.model.pageNumber) {
        groupedData.push(...pageData);
      } else {
        const groupElement = document.createElement("div");
        groupElement.className = this.options.groupClass || "pagination-group";
        groupElement.setAttribute("hidden", "false");
        groupElement.setAttribute("data-page", i.toString());
        groupElement.textContent = `Página ${i}`;
        groupedData.push(groupElement);
      }
    }
    return groupedData;
  }
}
class PaginationCore {
  constructor(container, options = {}) {
    this.isInitialized = false;
    this.generatePagesToShow = (currentPage, totalPage) => {
      let pagesToShow = [];
      let totalButtons;
      if (this.options.showEllipsis) {
        totalButtons = 7;
      } else {
        totalButtons = 5;
      }
      if (totalPage <= totalButtons) {
        pagesToShow = Array.from({ length: totalPage }, (_, i) => i + 1);
        return pagesToShow;
      }
      if (currentPage <= totalButtons / 2) {
        pagesToShow = [1, 2, 3, 4];
        if (this.options.showEllipsis) {
          pagesToShow.push("createElipsisHTML");
        }
        pagesToShow.push(totalPage);
      } else if (currentPage > totalButtons / 2 && currentPage < totalPage - 2) {
        pagesToShow = [1];
        if (this.options.showEllipsis) {
          pagesToShow.push("createElipsisHTML");
        }
        pagesToShow.push(currentPage - 1, currentPage, currentPage + 1);
        if (this.options.showEllipsis) {
          pagesToShow.push("createElipsisHTML");
        }
        pagesToShow.push(totalPage);
      } else if (currentPage >= totalPage - totalButtons / 2) {
        pagesToShow = [1];
        if (this.options.showEllipsis) {
          pagesToShow.push("createElipsisHTML");
        }
        pagesToShow.push(totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
      }
      return pagesToShow;
    };
    this.el = typeof container === "string" ? document.querySelector(container) : container;
    if (!this.el) {
      throw new Error("Container element not found");
    }
    this.options = mergeOptions(options);
    if (typeof this.options.dataSource === "string" && !this.options.dataSource.startsWith("http")) {
      const elements = Array.from(document.querySelectorAll(this.options.dataSource));
      this.options.dataSource = elements;
      this.options.totalNumber = elements.length;
    }
    this.model = this.createModel();
    this.eventHandler = new EventHandler(this.options, this.model, this.el);
    this.dataHandler = new DataHandler(this.options, this.model);
  }
  createModel() {
    return {
      pageNumber: this.options.pageNumber || 1,
      pageSize: this.options.pageSize || 10,
      totalNumber: this.options.totalNumber || 0,
      totalPage: Math.ceil((this.options.totalNumber || 0) / (this.options.pageSize || 10)),
      disabled: this.options.disabled || false
    };
  }
  async init() {
    if (this.isInitialized) return;
    if (this.options.beforeInit) {
      const result = this.options.beforeInit();
      if (result === false) return;
    }
    this.render();
    this.bindEvents();
    this.isInitialized = true;
    if (this.options.afterInit) {
      this.options.afterInit(this.el);
    }
    if (this.options.triggerPagingOnInit) {
      await this.paging();
    }
  }
  render(isForced = false) {
    if (this.options.beforeRender) {
      const result = this.options.beforeRender(isForced);
      if (result === false) return;
    }
    const args = this.getPaginationArgs();
    const html = generateHTML(args, this.options);
    this.el.innerHTML = html;
    if (this.options.afterRender) {
      this.options.afterRender(isForced);
    }
  }
  getPaginationArgs() {
    const currentPage = this.model.pageNumber;
    const pagesToShow = this.generatePagesToShow(currentPage, this.model.totalPage);
    let rangeStart = Math.max(1, currentPage - this.options.pageRange);
    let rangeEnd = Math.min(this.model.totalPage, currentPage + this.options.pageRange);
    if (rangeEnd - rangeStart < this.options.pageRange * 2) {
      if (rangeStart === 1) {
        rangeEnd = Math.min(this.model.totalPage, rangeStart + this.options.pageRange * 2);
      } else {
        rangeStart = Math.max(1, rangeEnd - this.options.pageRange * 2);
      }
    }
    return {
      totalPage: this.model.totalPage,
      currentPage,
      pageRange: this.options.pageRange,
      rangeStart,
      rangeEnd,
      pagesToShow
    };
  }
  bindEvents() {
    this.eventHandler.bindEvents();
    this.el.addEventListener("pagination", async (e) => {
      await this.paging();
    });
  }
  async paging() {
    if (this.model.disabled) return;
    try {
      this.updatePaginationState();
      const data = await this.dataHandler.getData();
      if (this.options.callback) {
        this.options.callback(data, this.model);
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, "paging");
      }
    }
  }
  updatePaginationState() {
    const currentPage = this.model.pageNumber;
    const totalPage = this.model.totalPage;
    const pageElements = this.el.querySelectorAll(`.${this.options.classPrefix}-page`);
    pageElements.forEach((pageEl) => {
      const pageNumber = parseInt(pageEl.getAttribute("data-num") || "1");
      if (pageNumber === currentPage) {
        pageEl.classList.add(this.options.activeClassName);
      } else {
        pageEl.classList.remove(this.options.activeClassName);
      }
    });
    const prevButton = this.el.querySelector(`.${this.options.classPrefix}-prev`);
    if (prevButton) {
      if (currentPage <= 1) {
        prevButton.classList.add(this.options.disableClassName);
        prevButton.removeAttribute("data-num");
      } else {
        prevButton.classList.remove(this.options.disableClassName);
        prevButton.setAttribute("data-num", (currentPage - 1).toString());
      }
    }
    const nextButton = this.el.querySelector(`.${this.options.classPrefix}-next`);
    if (nextButton) {
      if (currentPage >= totalPage) {
        nextButton.classList.add(this.options.disableClassName);
        nextButton.removeAttribute("data-num");
      } else {
        nextButton.classList.remove(this.options.disableClassName);
        nextButton.setAttribute("data-num", (currentPage + 1).toString());
      }
    }
    const args = this.getPaginationArgs();
    this.el.innerHTML = generateHTML(args, this.options);
  }
  // Métodos públicos
  async goToPage(pageNumber) {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPage) {
      pageNumber = totalPage;
    }
    if (pageNumber !== this.model.pageNumber) {
      this.model.pageNumber = pageNumber;
      await this.paging();
    }
  }
  async goToPreviousPage() {
    if (this.model.pageNumber > 1) {
      await this.goToPage(this.model.pageNumber - 1);
    }
  }
  async goToNextPage() {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    if (this.model.pageNumber < totalPage) {
      await this.goToPage(this.model.pageNumber + 1);
    }
  }
  async goToFirstPage() {
    await this.goToPage(1);
  }
  async goToLastPage() {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    await this.goToPage(totalPage);
  }
  async setPageSize(pageSize) {
    if (pageSize !== this.model.pageSize) {
      this.model.pageSize = pageSize;
      this.model.pageNumber = 1;
      await this.paging();
    }
  }
  async refresh() {
    await this.paging();
  }
  async destroy() {
    if (this.options.beforeDestroy) {
      const result = this.options.beforeDestroy();
      if (result === false) return;
    }
    this.el.innerHTML = "";
    this.isInitialized = false;
    if (this.options.afterDestroy) {
      this.options.afterDestroy();
    }
  }
  // Getters
  getModel() {
    return { ...this.model };
  }
  getOptions() {
    return { ...this.options };
  }
  getElement() {
    return this.el;
  }
  isDisabled() {
    return this.model.disabled;
  }
  // Setters
  setDisabled(disabled) {
    this.model.disabled = disabled;
  }
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.model = this.createModel();
  }
}
export {
  DEFAULT_OPTIONS,
  PaginationCore as Pagination
};
