import {PaginationOptions, PaginationModel, PaginationArgs} from './types';
import {mergeOptions} from './utils/utils';
import {generateElipsisHTML, generateHTML, generatePageHTML} from './generator/html-generator';
import {EventHandler} from './handlers/event-handler';
import {DataHandler} from './handlers/data-handler';

export class PaginationCore {
  private options: PaginationOptions;
  private model: PaginationModel;
  private el: HTMLElement;
  private eventHandler: EventHandler;
  private dataHandler: DataHandler;
  private isInitialized: boolean = false;

  constructor(container: string | HTMLElement, options: PaginationOptions = {}) {
    this.el =
      typeof container === 'string'
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.el) {
      throw new Error('Container element not found');
    }

    this.options = mergeOptions(options);

    // Si dataSource es un selector, convertirlo a array de elementos DOM
    if (
      typeof this.options.dataSource === 'string' &&
      !this.options.dataSource.startsWith('http')
    ) {
      const elements = Array.from(document.querySelectorAll(this.options.dataSource));
      this.options.dataSource = elements;
      this.options.totalNumber = elements.length;
    }

    this.model = this.createModel();
    this.eventHandler = new EventHandler(this.options, this.model, this.el);
    this.dataHandler = new DataHandler(this.options, this.model);
  }

  private createModel(): PaginationModel {
    return {
      pageNumber: this.options.pageNumber || 1,
      pageSize: this.options.pageSize || 10,
      totalNumber: this.options.totalNumber || 0,
      totalPage: Math.ceil((this.options.totalNumber || 0) / (this.options.pageSize || 10)),
      disabled: this.options.disabled || false,
    };
  }

  async init(): Promise<void> {
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

  private render(isForced: boolean = false): void {
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

  private getPaginationArgs(): PaginationArgs {
    const currentPage = this.model.pageNumber;
    const pagesToShow = this.generatePagesToShow(currentPage, this.model.totalPage!);

    let rangeStart = Math.max(1, currentPage - this.options.pageRange!);
    let rangeEnd = Math.min(this.model.totalPage!, currentPage + this.options.pageRange!);

    if (rangeEnd - rangeStart < this.options.pageRange! * 2) {
      if (rangeStart === 1) {
        rangeEnd = Math.min(this.model.totalPage!, rangeStart + this.options.pageRange! * 2);
      } else {
        rangeStart = Math.max(1, rangeEnd - this.options.pageRange! * 2);
      }
    }

    return {
      totalPage: this.model.totalPage!,
      currentPage,
      pageRange: this.options.pageRange!,
      rangeStart,
      rangeEnd,
      pagesToShow,
    };
  }

  private bindEvents(): void {
    this.eventHandler.bindEvents();

    this.el.addEventListener('pagination', async (e: Event) => {
      await this.paging();
    });
  }

  private async paging(): Promise<void> {
    if (this.model.disabled) return;

    try {
      // Actualizar solo las clases CSS sin re-renderizar todo
      this.updatePaginationState();

      const data = await this.dataHandler.getData();

      if (this.options.callback) {
        this.options.callback(data, this.model);
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error, 'paging');
      }
    }
  }

  private generatePagesToShow = (currentPage: number, totalPage: number) => {
    let pagesToShow: (number | string)[] = [];
    let totalButtons: number;

    if (this.options.showEllipsis) { 
      totalButtons = 7;
    } else {
      totalButtons = 5;
    }

    // Si hay menos de 7 páginas, mostrar todas
    if (totalPage <= totalButtons) {
      pagesToShow = Array.from({length: totalPage}, (_, i) => i + 1);
      return pagesToShow;
    }

    // Cerca del inicio: 1, 2, 3, 4, 5, ..., totalPage
    if (currentPage <= totalButtons / 2) {
      pagesToShow = [1, 2, 3, 4];
      if (this.options.showEllipsis) {
        pagesToShow.push('createElipsisHTML');
      }
      pagesToShow.push(totalPage);
    }
    // En el medio: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPage
    else if (currentPage > totalButtons / 2 && currentPage < totalPage - 2) {
      pagesToShow = [1];
      if (this.options.showEllipsis) {
        pagesToShow.push('createElipsisHTML');
      }
      pagesToShow.push(currentPage - 1, currentPage, currentPage + 1);
      if (this.options.showEllipsis) {
        pagesToShow.push('createElipsisHTML');
      }
      pagesToShow.push(totalPage);
    }
    // Cerca del final: 1, ..., totalPage-3, totalPage-2, totalPage-1, totalPage
    else if (currentPage >= totalPage - totalButtons / 2) {
      pagesToShow = [1];
      if (this.options.showEllipsis) {
        pagesToShow.push('createElipsisHTML');
      } 
      pagesToShow.push(totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1, totalPage);
    }

    return pagesToShow;
  };

  private updatePaginationState(): void {
    const currentPage = this.model.pageNumber;
    const totalPage = this.model.totalPage;

    // Actualizar clases de páginas
    const pageElements = this.el.querySelectorAll(`.${this.options.classPrefix!}-page`);
    pageElements.forEach((pageEl) => {
      const pageNumber = parseInt(pageEl.getAttribute('data-num') || '1');
      if (pageNumber === currentPage) {
        pageEl.classList.add(this.options.activeClassName!);
      } else {
        pageEl.classList.remove(this.options.activeClassName!);
      }
    });

    // Actualizar botón anterior
    const prevButton = this.el.querySelector(`.${this.options.classPrefix!}-prev`);
    if (prevButton) {
      if (currentPage <= 1) {
        prevButton.classList.add(this.options.disableClassName!);
        prevButton.removeAttribute('data-num');
      } else {
        prevButton.classList.remove(this.options.disableClassName!);
        prevButton.setAttribute('data-num', (currentPage - 1).toString());
      }
    }

    // Actualizar botón siguiente
    const nextButton = this.el.querySelector(`.${this.options.classPrefix!}-next`);
    if (nextButton) {
      if (currentPage >= totalPage) {
        nextButton.classList.add(this.options.disableClassName!);
        nextButton.removeAttribute('data-num');
      } else {
        nextButton.classList.remove(this.options.disableClassName!);
        nextButton.setAttribute('data-num', (currentPage + 1).toString());
      }
    }

    // Mostrar las páginas calculadas
    const args = this.getPaginationArgs();
    this.el.innerHTML = generateHTML(args, this.options);
  }

  // Métodos públicos
  async goToPage(pageNumber: number): Promise<void> {
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

  async goToPreviousPage(): Promise<void> {
    if (this.model.pageNumber > 1) {
      await this.goToPage(this.model.pageNumber - 1);
    }
  }

  async goToNextPage(): Promise<void> {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    if (this.model.pageNumber < totalPage) {
      await this.goToPage(this.model.pageNumber + 1);
    }
  }

  async goToFirstPage(): Promise<void> {
    await this.goToPage(1);
  }

  async goToLastPage(): Promise<void> {
    const totalPage = Math.ceil(this.model.totalNumber / this.model.pageSize);
    await this.goToPage(totalPage);
  }

  async setPageSize(pageSize: number): Promise<void> {
    if (pageSize !== this.model.pageSize) {
      this.model.pageSize = pageSize;
      this.model.pageNumber = 1;
      await this.paging();
    }
  }

  async refresh(): Promise<void> {
    await this.paging();
  }

  async destroy(): Promise<void> {
    if (this.options.beforeDestroy) {
      const result = this.options.beforeDestroy();
      if (result === false) return;
    }

    this.el.innerHTML = '';
    this.isInitialized = false;

    if (this.options.afterDestroy) {
      this.options.afterDestroy();
    }
  }

  // Getters
  getModel(): PaginationModel {
    return {...this.model};
  }

  getOptions(): PaginationOptions {
    return {...this.options};
  }

  getElement(): HTMLElement {
    return this.el;
  }

  isDisabled(): boolean {
    return this.model.disabled;
  }

  // Setters
  setDisabled(disabled: boolean): void {
    this.model.disabled = disabled;
  }

  updateOptions(newOptions: Partial<PaginationOptions>): void {
    this.options = {...this.options, ...newOptions};
    this.model = this.createModel();
  }
}
