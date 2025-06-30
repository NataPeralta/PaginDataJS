import {PaginationOptions, PaginationModel} from '../types';
import {filterDataWithLocator} from '../utils/utils';

export class DataHandler {
  private options: PaginationOptions;
  private model: PaginationModel;

  constructor(options: PaginationOptions, model: PaginationModel) {
    this.options = options;
    this.model = model;
  }

  async getData(): Promise<any[]> {
    const dataSource = this.options.dataSource;

    if (!dataSource) {
      return [];
    }

    if (Array.isArray(dataSource)) {
      return this.processArrayData(dataSource);
    }

    if (typeof dataSource === 'function') {
      return this.processFunctionData(dataSource);
    }

    if (typeof dataSource === 'string') {
      return this.processAjaxData(dataSource);
    }

    return [];
  }

  private processArrayData(data: any[]): any[] {
    const filteredData = filterDataWithLocator(data, this.options.locator);

    this.model.totalNumber = filteredData.length;

    if (this.options.groupItems) {
      return this.groupData(filteredData);
    }

    return this.paginateData(filteredData);
  }

  private async processFunctionData(
    dataFunction: (callback: (data: any) => void) => void
  ): Promise<any[]> {
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

  private async processAjaxData(url: string): Promise<any[]> {
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
        this.options.onError(error as Error, 'ajax');
      }
      return [];
    }
  }

  private getAjaxOptions(): any {
    const ajax = this.options.ajax;

    if (typeof ajax === 'function') {
      return ajax();
    }

    return ajax || {};
  }

  private async makeAjaxRequest(url: string, options: any): Promise<any> {
    const {type = 'GET', data, contentType, dataType, async = true, cache = true} = options;

    const requestOptions: RequestInit = {
      method: type,
      headers: {
        'Content-Type': contentType || 'application/x-www-form-urlencoded',
      },
    };

    if (type === 'POST' && data) {
      requestOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    if (!cache) {
      requestOptions.cache = 'no-cache';
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (dataType === 'json') {
      return response.json();
    }

    return response.text();
  }

  private processAjaxResponse(response: any): any {
    // Si la respuesta ya es un array, retornarla directamente
    if (Array.isArray(response)) {
      return response;
    }

    // Si es un string, intentar parsearlo como JSON
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch (e) {
        return response;
      }
    }

    return response;
  }

  private paginateData(data: any[]): any[] {
    const startIndex = (this.model.pageNumber - 1) * this.model.pageSize;
    const endIndex = startIndex + this.model.pageSize;
    const pageData = data.slice(startIndex, endIndex);

    // Si los datos son elementos DOM, ocultar/mostrar automáticamente
    if (data.length > 0 && data[0] instanceof HTMLElement) {
      // Ocultar todos los elementos primero
      data.forEach((item: HTMLElement) => {
        item.setAttribute('hidden', '');
      });

      // Mostrar solo los elementos de la página actual
      pageData.forEach((item: HTMLElement) => {
        item.removeAttribute('hidden');
      });
    }

    return pageData;
  }

  private groupData(data: any[]): any[] {
    const groupedData: any[] = [];
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);

    for (let i = 1; i <= totalPage; i++) {
      const startIndex = (i - 1) * this.model.pageSize;
      const endIndex = startIndex + this.model.pageSize;
      const pageData = data.slice(startIndex, endIndex);

      if (i === this.model.pageNumber) {
        groupedData.push(...pageData);
      } else {
        const groupElement = document.createElement('div');
        groupElement.className = this.options.groupClass || 'pagination-group';
        groupElement.setAttribute('hidden', 'false');
        groupElement.setAttribute('data-page', i.toString());

        // Aquí podrías agregar los elementos de la página al grupo
        // Por simplicidad, solo agregamos un marcador
        groupElement.textContent = `Página ${i}`;

        groupedData.push(groupElement);
      }
    }

    return groupedData;
  }
}
