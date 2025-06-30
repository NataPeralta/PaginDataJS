import {PaginationOptions} from '../types';
import {DEFAULT_OPTIONS} from './constants';

export function mergeOptions(options: PaginationOptions): PaginationOptions {
  return {...DEFAULT_OPTIONS, ...options};
}

export function replaceVariables(template: string, variables: Record<string, any>): string {
  let formattedString = template;

  for (const [key, value] of Object.entries(variables)) {
    const regexp = new RegExp('<%=\\s*' + key + '\\s*%>', 'img');
    formattedString = formattedString.replace(regexp, value);
  }

  return formattedString;
}

export function getPageLinkTag(index: number | string, pageLink?: string): string {
  return pageLink ? `<a href="${pageLink}">${index}</a>` : `<a>${index}</a>`;
}

export function getLocator(locator: string | (() => string)): string {
  if (typeof locator === 'string') {
    return locator;
  } else if (typeof locator === 'function') {
    return locator();
  } else {
    throw new Error('"locator" is incorrect. Expect string or function type.');
  }
}

export function filterDataWithLocator(dataSource: any, locator?: string | (() => string)): any[] {
  // Si dataSource es un array, retornarlo directamente
  if (Array.isArray(dataSource)) {
    return dataSource;
  }

  // Si no hay locator definido, retornar el dataSource
  if (!locator) {
    return dataSource;
  }

  const locatorPath = getLocator(locator);
  let filteredData: any;

  if (typeof dataSource === 'object') {
    try {
      const parts = locatorPath.split('.');
      for (const part of parts) {
        filteredData = (filteredData ? filteredData : dataSource)[part];
      }
    } catch (e) {
      // ignore
    }

    if (!filteredData) {
      throw new Error('dataSource.' + locatorPath + ' is undefined.');
    } else if (!Array.isArray(filteredData)) {
      throw new Error('dataSource.' + locatorPath + ' should be an Array.');
    }
  }

  return filteredData || dataSource;
}
