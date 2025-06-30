import {PaginationOptions, PaginationArgs} from '../types';
import {replaceVariables, getPageLinkTag} from '../utils/utils';

export function generateElipsisHTML(classPrefix: string, ellipsisText: string): string {
  return `<li class="${classPrefix}-ellipsis"><a>${ellipsisText}</a></li>`;
}

export function generatePageHTML({
  classPrefix,
  pageNumber,
  isActive = false,
  activeClassName,
}: {
  classPrefix: string;
  pageNumber: number;
  isActive?: boolean;
  activeClassName?: string;
}): string {
  const activeClass = isActive && activeClassName ? ` ${activeClassName}` : '';
  return `<li class="${classPrefix}-page${activeClass}" data-num="${pageNumber}"><a>${pageNumber}</a></li>`;
}

export function generateBackHTML(
  classPrefix: string,
  pageNumber: number,
  text: string,
  options: PaginationOptions
): string {
  return `<li class="${classPrefix}-prev ${
    options.nextClassName || ''
  }" title="Previous page" data-num="${pageNumber}"><a>${text}</a></li>`;
}

export function generateNextHTML(
  classPrefix: string,
  pageNumber: number,
  text: string,
  options: PaginationOptions
): string {
  return `<li class="${classPrefix}-next ${
    options.nextClassName || ''
  }" title="Next page" data-num="${pageNumber}"><a>${text}</a></li>`;
}

export function generateHTML(args: PaginationArgs, options: PaginationOptions): string {
  //Saber cuantas paginas hay
  const currentPage = args.currentPage;
  const pagesToShow = args.pagesToShow;
  const rangeStart = args.rangeStart;
  const rangeEnd = args.rangeEnd;
  const totalPage = args.totalPage;

  let html = '';
  let sizeSelect = `<select class="${options.classPrefix!}-size-select">`;
  const goInput = `<input type="text" class="${options.classPrefix!}-go-pagenumber">`;
  const goButton = `<input type="button" class="${options.classPrefix!}-go-button" value="${options.goButtonText!}">`;
  let formattedString: string;

  const formatSizeChanger =
    typeof options.formatSizeChanger === 'function'
      ? options.formatSizeChanger(sizeSelect, options.totalNumber!)
      : options.formatSizeChanger;

  const formatNavigator =
    typeof options.formatNavigator === 'function'
      ? options.formatNavigator(currentPage, totalPage, options.totalNumber!)
      : options.formatNavigator;

  const formatGoInput =
    typeof options.formatGoInput === 'function'
      ? options.formatGoInput(goInput, currentPage, totalPage, options.totalNumber!)
      : options.formatGoInput;

  const formatGoButton =
    typeof options.formatGoButton === 'function'
      ? options.formatGoButton(goButton, currentPage, totalPage, options.totalNumber!)
      : options.formatGoButton;

  const autoHidePrevious =
    typeof options.autoHidePrevious === 'function'
      ? options.autoHidePrevious()
      : options.autoHidePrevious;

  const autoHideNext =
    typeof options.autoHideNext === 'function' ? options.autoHideNext() : options.autoHideNext;

  const header =
    typeof options.header === 'function'
      ? options.header(currentPage, totalPage, options.totalNumber!)
      : options.header;

  const footer =
    typeof options.footer === 'function'
      ? options.footer(currentPage, totalPage, options.totalNumber!)
      : options.footer;

  if (header) {
    formattedString = replaceVariables(header, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber!,
    });
    html += formattedString;
  }

  if (options.showNavigator && formatNavigator) {
    formattedString = replaceVariables(formatNavigator, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber!,
      rangeStart: (currentPage - 1) * options.pageSize! + 1,
      rangeEnd: Math.min(currentPage * options.pageSize!, options.totalNumber!),
    });
    html += `<div class="${options.classPrefix}-nav">${formattedString}</div>`;
  }

  if (options.showPrevious || options.showPageNumbers || options.showNext) {
    html += '<div class="paginationjs-pages">';
    html += options.ulClassName ? `<ul class="${options.ulClassName}">` : '<ul>';

    if (options.showPrevious) {
      html += generateBackHTML(
        options.classPrefix!,
        currentPage - 1,
        options.prevText || '',
        options
      );
    }

    if (options.showPageNumbers) {
      if (pagesToShow && pagesToShow.length > 0) {
        pagesToShow.forEach((item) => {
          if (typeof item === 'number') {
            html += generatePageHTML({
              classPrefix: options.classPrefix!,
              pageNumber: item,
              isActive: item === currentPage,
              activeClassName: options.activeClassName!,
            });
          } else if (item === 'createElipsisHTML') {
            html += generateElipsisHTML(options.classPrefix!, options.ellipsisText!);
          }
        });
      } else {
        for (let i = 1; i <= totalPage; i++) {
          html += generatePageHTML({
            classPrefix: options.classPrefix!,
            pageNumber: i,
            isActive: i === currentPage,
            activeClassName: options.activeClassName!,
          });
        }
      }
    }

    if (options.showNext) {
      html += generateNextHTML(
        options.classPrefix!,
        currentPage + 1,
        options.nextText || '',
        options
      );
    }

    html += '</ul></div>';
  }

  if (options.showSizeChanger && Array.isArray(options.sizeChangerOptions)) {
    if (options.sizeChangerOptions.indexOf(options.pageSize!) === -1) {
      options.sizeChangerOptions.unshift(options.pageSize!);
      options.sizeChangerOptions.sort((a, b) => a - b);
    }
    for (let i = 0; i < options.sizeChangerOptions.length; i++) {
      sizeSelect += `<option value="${options.sizeChangerOptions[i]}"${
        options.sizeChangerOptions[i] === options.pageSize! ? ' selected' : ''
      }>${options.sizeChangerOptions[i]} / page</option>`;
    }
    sizeSelect += '</select>';
    formattedString = sizeSelect;

    if (formatSizeChanger) {
      formattedString = replaceVariables(formatSizeChanger, {
        length: sizeSelect,
        total: options.totalNumber!,
      });
    }
    html += `<div class="paginationjs-size-changer">${formattedString}</div>`;
  }

  if (options.showGoInput && formatGoInput) {
    formattedString = replaceVariables(formatGoInput, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber!,
      input: goInput,
    });
    html += `<div class="${options.classPrefix}-go-input">${formattedString}</div>`;
  }

  if (options.showGoButton && formatGoButton) {
    formattedString = replaceVariables(formatGoButton, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber!,
      button: goButton,
    });
    html += `<div class="${options.classPrefix}-go-button">${formattedString}</div>`;
  }

  if (footer) {
    formattedString = replaceVariables(footer, {
      currentPage,
      totalPage,
      totalNumber: options.totalNumber!,
    });
    html += formattedString;
  }

  return html;
}
